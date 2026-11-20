// Public routes: sign up / in (email + password, Google, Face ID), sign out, account status, claim the old single-user data
// Returns a Response when the route matches, otherwise null.

import { authed, endSession, hashPw, legacyPinOk, newSession, sessionCookie, verifyGoogle } from "../auth.js";
import { conf } from "../db.js";
import { derToRaw, newChallenge, rpOk, useChallenge } from "../passkey.js";
import { limited } from "../ratelimit.js";
import { b64uDec, concat, json } from "../utils.js";

const okEmail = (e) => typeof e === "string" && e.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const signedIn = async (env, uid) => json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await newSession(env, uid)) });
const newId = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
async function legacyState(env) {
  const c = await conf(env);
  if (c.LEGACY_OWNER) return { legacy: false };
  const r = await env.DB.prepare("SELECT COUNT(*) n FROM docs").first().catch(() => ({ n: 0 }));
  return { legacy: (r && r.n) > 0 && !!(c.ACCESS_PIN || c.PIN_HASH), docs: r ? r.n : 0 };
}

export async function sessionRoutes(req, env, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/auth/status" && m === "GET") {
    const uid = await authed(req, env), c = await conf(env), lg = await legacyState(env);
    let me = null;
    if (uid) { const u = await env.DB.prepare("SELECT id, email, name, gsub, pw, bio, priv FROM users WHERE id = ?1").bind(uid).first(); if (u) me = { id: u.id, email: u.email, name: u.name, google: !!u.gsub, password: !!u.pw, bio: u.bio || "", privacy: JSON.parse(u.priv || "{}"), owner: c.LEGACY_OWNER === u.id, admin: c.LEGACY_OWNER === u.id }; }
    return json({ me, googleClientId: c.GOOGLE_CLIENT_ID || "", ...lg });
  }
  if (p === "/api/auth/signup" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const { email, password, name } = await req.json().catch(() => ({}));
    const e = String(email || "").trim().toLowerCase();
    if (!okEmail(e)) return json({ error: "bad email" }, 400);
    if (typeof password !== "string" || password.length < 8 || password.length > 200) return json({ error: "password too short" }, 400);
    if (await env.DB.prepare("SELECT 1 FROM users WHERE email = ?1").bind(e).first()) return json({ error: "email taken" }, 409);
    const { hash, salt } = await hashPw(password), id = newId();
    await env.DB.prepare("INSERT INTO users (id, email, name, pw, salt, created) VALUES (?1, ?2, ?3, ?4, ?5, ?6)").bind(id, e, String(name || "").trim().slice(0, 60) || e.split("@")[0], hash, salt, Date.now()).run();
    return signedIn(env, id);
  }
  if (p === "/api/auth/login" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const { email, password } = await req.json().catch(() => ({}));
    const u = await env.DB.prepare("SELECT id, pw, salt FROM users WHERE email = ?1").bind(String(email || "").trim().toLowerCase()).first();
    if (!u || !u.pw || (await hashPw(String(password || ""), u.salt)).hash !== u.pw) return json({ error: "wrong email or password" }, 401);
    return signedIn(env, u.id);
  }
  if (p === "/api/auth/google" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const { credential } = await req.json().catch(() => ({}));
    const g = await verifyGoogle(env, credential).catch(() => null);
    if (!g || !g.sub) return json({ error: "google sign-in failed" }, 401);
    let u = await env.DB.prepare("SELECT id FROM users WHERE gsub = ?1").bind(g.sub).first();
    const e = g.email_verified && okEmail(g.email) ? g.email.toLowerCase() : null;
    if (!u && e) { u = await env.DB.prepare("SELECT id FROM users WHERE email = ?1").bind(e).first(); if (u) await env.DB.prepare("UPDATE users SET gsub = ?2 WHERE id = ?1").bind(u.id, g.sub).run(); }
    if (!u) { u = { id: newId() }; await env.DB.prepare("INSERT INTO users (id, email, name, gsub, created) VALUES (?1, ?2, ?3, ?4, ?5)").bind(u.id, e, String(g.name || "").slice(0, 60) || (e || "").split("@")[0], g.sub, Date.now()).run(); }
    return signedIn(env, u.id);
  }
  if (p === "/api/logout" && m === "POST") {
    await endSession(req, env);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(null) });
  }
  // one-time: the signed-in user proves they own the old PIN-protected data; it is copied into their account
  if (p === "/api/auth/claim" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const uid = await authed(req, env); if (!uid) return json({ error: "unauthorized" }, 401);
    if (!(await legacyState(env)).legacy) return json({ error: "nothing to claim" }, 409);
    const { pin } = await req.json().catch(() => ({}));
    if (!(await legacyPinOk(env, pin))) return json({ error: "wrong pin" }, 401);
    await env.DB.batch([
      env.DB.prepare("INSERT OR REPLACE INTO udocs (uid, id, value, updated) SELECT ?1, id, value, updated FROM docs").bind(uid),
      env.DB.prepare("UPDATE creds SET uid = ?1 WHERE uid IS NULL").bind(uid),
      env.DB.prepare("UPDATE subs SET uid = ?1 WHERE uid IS NULL").bind(uid),
      env.DB.prepare("INSERT OR REPLACE INTO config (k, v) VALUES ('LEGACY_OWNER', ?1)").bind(uid),
    ]);
    env.__conf = null;
    return json({ ok: true });
  }

  /* ---- passkey (Face ID / Touch ID) login: the passkey belongs to one user ---- */
  if (p === "/api/passkey/login/options" && m === "POST") {
    const c = await newChallenge(env, "login");
    return json({ challenge: c, rpId: url.hostname, allow: [] });
  }
  if (p === "/api/passkey/login" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const b = await req.json();
    const cred = await env.DB.prepare("SELECT pk, alg, uid FROM creds WHERE id = ?1").bind(b.id).first();
    if (!cred || !cred.uid) return json({ error: "unknown passkey" }, 401);
    const cd = JSON.parse(new TextDecoder().decode(b64uDec(b.clientDataJSON)));
    if (cd.type !== "webauthn.get" || cd.origin !== url.origin || !(await useChallenge(env, cd.challenge, "login"))) return json({ error: "bad challenge" }, 401);
    const ad = b64uDec(b.authenticatorData);
    if (!(await rpOk(ad, url.hostname)) || (ad[32] & 0x05) !== 0x05) return json({ error: "user not verified" }, 401);
    const key = await crypto.subtle.importKey("spki", b64uDec(cred.pk), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const signed = concat(ad, new Uint8Array(await crypto.subtle.digest("SHA-256", b64uDec(b.clientDataJSON))));
    const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, derToRaw(b64uDec(b.signature)), signed);
    if (!ok) return json({ error: "bad signature" }, 401);
    return signedIn(env, cred.uid);
  }

  return null;
}
