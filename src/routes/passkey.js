// Passkey management (requires login)
// Returns a Response when the route matches, otherwise null.

import { newChallenge, useChallenge } from "../passkey.js";
import { b64u, b64uDec, enc, json } from "../utils.js";

export async function passkeyRoutes(req, env, url, uid) {
  const p = url.pathname, m = req.method;

  if (p === "/api/passkey/register/options" && m === "POST") {
    const c = await newChallenge(env, "reg");
    const { results } = await env.DB.prepare("SELECT id FROM creds WHERE uid = ?1").bind(uid).all();
    const u = await env.DB.prepare("SELECT email, name FROM users WHERE id = ?1").bind(uid).first();
    return json({ challenge: c, rpId: url.hostname, userId: b64u(enc(uid)), userName: (u && (u.email || u.name)) || "user", exclude: results.map((r) => r.id) });
  }
  if (p === "/api/passkey/register" && m === "POST") {
    const b = await req.json();
    const cd = JSON.parse(new TextDecoder().decode(b64uDec(b.clientDataJSON)));
    if (cd.type !== "webauthn.create" || cd.origin !== url.origin || !(await useChallenge(env, cd.challenge, "reg"))) return json({ error: "bad challenge" }, 400);
    if (b.alg !== -7 || !b.publicKey) return json({ error: "unsupported key" }, 400);
    await crypto.subtle.importKey("spki", b64uDec(b.publicKey), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    await env.DB.prepare("INSERT OR REPLACE INTO creds (id, pk, alg, name, created, uid) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
      .bind(b.id, b.publicKey, b.alg, String(b.name || "").slice(0, 60), Date.now(), uid).run();
    return json({ ok: true });
  }
  if (p === "/api/passkey/list" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT id, name, created FROM creds WHERE uid = ?1").bind(uid).all();
    return json(results);
  }
  if (p === "/api/passkey/clear" && m === "POST") {
    await env.DB.prepare("DELETE FROM creds WHERE uid = ?1").bind(uid).run();
    return json({ ok: true });
  }

  return null;
}
