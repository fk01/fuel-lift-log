// Fuel & Lift Log — Cloudflare Worker (static assets + D1 API + Web Push reminders)

const TZ_HOURS = 7; // Asia/Bangkok
const COOKIE = "fl_auth";

// มื้อและวิตามินที่จะเตือน (ตรงกับ MEALS ในหน้าเว็บ)
const REMINDERS = [
  { id: "m1", time: "08:00", title: "🍳 มื้อเช้า", body: "Iso Soy 2 + Mass 2 สกู๊ป · กล้วย 2 ลูก" },
  { id: "v1", time: "08:15", title: "💊 วิตามินหลังมื้อเช้า", body: "อย่าลืมวิตามินชุดเช้า" },
  { id: "m2", time: "12:30", title: "🍚 มื้อกลางวัน", body: "ข้าวกล้อง 150 g · เนื้อวัว 100 g · ไข่ 1 · ผัก" },
  { id: "m3", time: "15:00", title: "🥤 มื้อบ่าย", body: "Iso Soy 2 + Mass 2 สกู๊ป · ถั่ว 1 กำมือ" },
  { id: "m4", time: "19:00", late: "18:00", title: "🍽️ มื้อเย็น (มื้อสุดท้าย)", body: "ข้าวกล้อง 150 g · ปลา/อกไก่ 100 g · ไข่ 1 · ผัก" },
  { id: "v2", time: "19:15", late: "18:15", title: "💊 วิตามินหลังมื้อเย็น", body: "อย่าลืมวิตามินชุดเย็น" },
];

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        await init(env);
        return await api(req, env, url);
      } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(init(env).then(() => remind(env)));
  },
};

/* ---------------- DB ---------------- */
let ready = false;
async function init(env) {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, value TEXT NOT NULL, updated INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS subs (endpoint TEXT PRIMARY KEY, sub TEXT NOT NULL, created INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sent (key TEXT PRIMARY KEY, ts INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS creds (id TEXT PRIMARY KEY, pk TEXT NOT NULL, alg INTEGER NOT NULL, name TEXT, created INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS challenges (c TEXT PRIMARY KEY, kind TEXT NOT NULL, ts INTEGER NOT NULL)"),
  ]);
  ready = true;
}

/* ---------------- API ---------------- */
async function api(req, env, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/login" && m === "POST") {
    const { pin } = await req.json().catch(() => ({}));
    if (!env.ACCESS_PIN) return json({ error: "ACCESS_PIN is not set" }, 500);
    if (String(pin || "").trim() !== String(env.ACCESS_PIN).trim()) return json({ error: "wrong pin" }, 401);
    const tok = await token(env);
    return json({ ok: true }, 200, {
      "Set-Cookie": `${COOKIE}=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
    });
  }
  if (p === "/api/logout" && m === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }

  /* ---- passkey (Face ID / Touch ID) login ---- */
  if (p === "/api/passkey/login/options" && m === "POST") {
    const { results } = await env.DB.prepare("SELECT id FROM creds").all();
    if (!results.length) return json({ error: "no passkey" }, 404);
    const c = await newChallenge(env, "login");
    return json({ challenge: c, rpId: url.hostname, allow: results.map((r) => r.id) });
  }
  if (p === "/api/passkey/login" && m === "POST") {
    const b = await req.json();
    const cred = await env.DB.prepare("SELECT pk, alg FROM creds WHERE id = ?1").bind(b.id).first();
    if (!cred) return json({ error: "unknown passkey" }, 401);
    const cd = JSON.parse(new TextDecoder().decode(b64uDec(b.clientDataJSON)));
    if (cd.type !== "webauthn.get" || cd.origin !== url.origin || !(await useChallenge(env, cd.challenge, "login"))) return json({ error: "bad challenge" }, 401);
    const ad = b64uDec(b.authenticatorData);
    if (!(await rpOk(ad, url.hostname)) || (ad[32] & 0x05) !== 0x05) return json({ error: "user not verified" }, 401);
    const key = await crypto.subtle.importKey("spki", b64uDec(cred.pk), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const signed = concat(ad, new Uint8Array(await crypto.subtle.digest("SHA-256", b64uDec(b.clientDataJSON))));
    const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, derToRaw(b64uDec(b.signature)), signed);
    if (!ok) return json({ error: "bad signature" }, 401);
    const tok = await token(env);
    return json({ ok: true }, 200, { "Set-Cookie": `${COOKIE}=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000` });
  }

  if (!(await authed(req, env))) return json({ error: "unauthorized" }, 401);

  if (p === "/api/passkey/register/options" && m === "POST") {
    const c = await newChallenge(env, "reg");
    const { results } = await env.DB.prepare("SELECT id FROM creds").all();
    return json({ challenge: c, rpId: url.hostname, userId: b64u(enc("fuel-lift-owner")), exclude: results.map((r) => r.id) });
  }
  if (p === "/api/passkey/register" && m === "POST") {
    const b = await req.json();
    const cd = JSON.parse(new TextDecoder().decode(b64uDec(b.clientDataJSON)));
    if (cd.type !== "webauthn.create" || cd.origin !== url.origin || !(await useChallenge(env, cd.challenge, "reg"))) return json({ error: "bad challenge" }, 400);
    if (b.alg !== -7 || !b.publicKey) return json({ error: "unsupported key" }, 400);
    await crypto.subtle.importKey("spki", b64uDec(b.publicKey), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    await env.DB.prepare("INSERT OR REPLACE INTO creds (id, pk, alg, name, created) VALUES (?1, ?2, ?3, ?4, ?5)")
      .bind(b.id, b.publicKey, b.alg, String(b.name || "").slice(0, 60), Date.now()).run();
    return json({ ok: true });
  }
  if (p === "/api/passkey/list" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT id, name, created FROM creds").all();
    return json(results);
  }
  if (p === "/api/passkey/clear" && m === "POST") {
    await env.DB.prepare("DELETE FROM creds").run();
    return json({ ok: true });
  }

  if (p === "/api/docs" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT id, value FROM docs").all();
    return json(results.map((r) => ({ id: r.id, value: JSON.parse(r.value) })));
  }
  const dm = p.match(/^\/api\/docs\/(.+)$/);
  if (dm) {
    const id = decodeURIComponent(dm[1]);
    if (!/^[\w.\-]{1,80}$/.test(id)) return json({ error: "bad id" }, 400);
    if (m === "PUT") {
      const body = await req.text();
      if (body.length > 900_000) return json({ error: "too large" }, 413);
      JSON.parse(body);
      await env.DB.prepare("INSERT INTO docs (id, value, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET value = ?2, updated = ?3")
        .bind(id, body, Date.now()).run();
      return json({ ok: true });
    }
    if (m === "DELETE") {
      await env.DB.prepare("DELETE FROM docs WHERE id = ?1").bind(id).run();
      return json({ ok: true });
    }
  }
  if (p === "/api/import" && m === "POST") {
    const data = await req.json();
    const stmts = [];
    const put = (id, v) => stmts.push(env.DB.prepare("INSERT INTO docs (id, value, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET value = ?2, updated = ?3").bind(id, JSON.stringify(v), Date.now()));
    for (const [date, v] of Object.entries(data.food || {})) if (/^\d{4}-\d\d-\d\d$/.test(date)) put("f-" + date, { date, ...v });
    for (const l of data.gymLogs || []) put(`g-${l.date}-${l.prog}`, l);
    if (data.programs || data.restSettings) put("settings", { restCfg: data.restSettings || {}, draft: {}, progs: data.programs, unit: data.displayUnit || "kg", scheme: 3 });
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true, imported: stmts.length });
  }

  if (p === "/api/push/key" && m === "GET") return json({ key: env.VAPID_PUBLIC_KEY || "" });
  if (p === "/api/push/subscribe" && m === "POST") {
    const sub = await req.json();
    if (!sub || !sub.endpoint || !sub.keys) return json({ error: "bad subscription" }, 400);
    await env.DB.prepare("INSERT INTO subs (endpoint, sub, created) VALUES (?1, ?2, ?3) ON CONFLICT(endpoint) DO UPDATE SET sub = ?2")
      .bind(sub.endpoint, JSON.stringify(sub), Date.now()).run();
    return json({ ok: true });
  }
  if (p === "/api/push/unsubscribe" && m === "POST") {
    const { endpoint } = await req.json().catch(() => ({}));
    if (endpoint) await env.DB.prepare("DELETE FROM subs WHERE endpoint = ?1").bind(endpoint).run();
    return json({ ok: true });
  }
  if (p === "/api/push/test" && m === "POST") {
    const n = await broadcast(env, { title: "✅ Fuel & Lift", body: "การแจ้งเตือนใช้งานได้แล้ว", url: "/" });
    return json({ ok: true, sent: n });
  }

  return json({ error: "not found" }, 404);
}

/* ---------------- auth ---------------- */
async function token(env) {
  const d = await crypto.subtle.digest("SHA-256", enc(`${String(env.ACCESS_PIN).trim()}:fuel-lift-log`));
  return b64u(new Uint8Array(d));
}
async function authed(req, env) {
  if (!env.ACCESS_PIN) return false;
  const c = (req.headers.get("Cookie") || "").split(/;\s*/).find((x) => x.startsWith(COOKIE + "="));
  return !!c && c.slice(COOKIE.length + 1) === (await token(env));
}

/* ---------------- passkey helpers ---------------- */
async function newChallenge(env, kind) {
  const c = b64u(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM challenges WHERE ts < ?1").bind(Date.now() - 5 * 60e3),
    env.DB.prepare("INSERT INTO challenges (c, kind, ts) VALUES (?1, ?2, ?3)").bind(c, kind, Date.now()),
  ]);
  return c;
}
async function useChallenge(env, c, kind) {
  const r = await env.DB.prepare("DELETE FROM challenges WHERE c = ?1 AND kind = ?2 AND ts > ?3 RETURNING c").bind(c, kind, Date.now() - 5 * 60e3).first();
  return !!r;
}
async function rpOk(ad, host) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc(host)));
  for (let i = 0; i < 32; i++) if (ad[i] !== h[i]) return false;
  return true;
}
function derToRaw(der) {
  // ECDSA DER (SEQUENCE{INTEGER r, INTEGER s}) -> 64-byte r||s
  let o = 2; if (der[1] & 0x80) o += der[1] & 0x7f;
  const read = () => { o++; const len = der[o++]; let v = der.slice(o, o + len); o += len; while (v.length > 32 && v[0] === 0) v = v.slice(1); const out = new Uint8Array(32); out.set(v, 32 - v.length); return out; };
  return concat(read(), read());
}

/* ---------------- reminders (cron) ---------------- */
async function remind(env) {
  const now = new Date(Date.now() + TZ_HOURS * 3600e3);
  const date = now.toISOString().slice(0, 10);
  const mins = Math.round((now.getUTCHours() * 60 + now.getUTCMinutes()) / 15) * 15;
  const hhmm = `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  const row = await env.DB.prepare("SELECT value FROM docs WHERE id = ?1").bind("f-" + date).first();
  const day = row ? JSON.parse(row.value) : { done: {}, tags: {} };
  const late = !!(day.tags && day.tags.late);

  for (const r of REMINDERS) {
    const t = late && r.late ? r.late : r.time;
    if (t !== hhmm) continue;
    if (day.done && day.done[r.id]) continue;
    const key = `${date}-${r.id}`;
    const dup = await env.DB.prepare("SELECT 1 FROM sent WHERE key = ?1").bind(key).first();
    if (dup) continue;
    await env.DB.prepare("INSERT INTO sent (key, ts) VALUES (?1, ?2)").bind(key, Date.now()).run();
    await broadcast(env, { title: r.title, body: r.body, url: "/#food", tag: r.id });
  }
  // ล้างประวัติการส่งที่เก่ากว่า 7 วัน
  await env.DB.prepare("DELETE FROM sent WHERE ts < ?1").bind(Date.now() - 7 * 864e5).run();
}

async function broadcast(env, msg) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_JWK) return 0;
  const { results } = await env.DB.prepare("SELECT endpoint, sub FROM subs").all();
  let n = 0;
  for (const r of results) {
    try {
      const status = await sendPush(env, JSON.parse(r.sub), JSON.stringify(msg));
      if (status === 404 || status === 410) await env.DB.prepare("DELETE FROM subs WHERE endpoint = ?1").bind(r.endpoint).run();
      else if (status < 300) n++;
    } catch (e) { console.log("push error", e); }
  }
  return n;
}

/* ---------------- Web Push (VAPID + aes128gcm, RFC 8291/8292) ---------------- */
async function sendPush(env, sub, payload) {
  const aud = new URL(sub.endpoint).origin;
  const jwt = await vapidJwt(env, aud);
  const body = await encryptPayload(sub, payload);
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      TTL: "3600",
      Urgency: "high",
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
    },
    body,
  });
  return res.status;
}

async function vapidJwt(env, aud) {
  const header = b64u(enc(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64u(enc(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || "mailto:admin@example.com" })));
  const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_PRIVATE_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc(`${header}.${claims}`));
  return `${header}.${claims}.${b64u(new Uint8Array(sig))}`;
}

async function encryptPayload(sub, text) {
  const uaPublic = b64uDec(sub.keys.p256dh);
  const authSecret = b64uDec(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(enc("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(enc(text), new Uint8Array([2]))));
  const head = new Uint8Array(21 + asPublic.length);
  head.set(salt, 0);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPublic.length;
  head.set(asPublic, 21);
  return concat(head, ct);
}

async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}

/* ---------------- utils ---------------- */
function json(v, status = 200, headers = {}) {
  return new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}
function enc(s) { return new TextEncoder().encode(s); }
function concat(...a) { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; }
function b64u(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function b64uDec(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }
