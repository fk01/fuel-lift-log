// Accounts: password hashing (PBKDF2), per-device session tokens, Google ID-token check, legacy PIN

import { COOKIE } from "./config.js";
import { conf } from "./db.js";
import { b64u, b64uDec, enc } from "./utils.js";

export async function hashPin(pin) {
  const d = await crypto.subtle.digest("SHA-256", enc(`${pin}:fuel-lift-log`));
  return b64u(new Uint8Array(d));
}
// the single-user PIN from before accounts — only used to claim the old data once
export async function legacyPinOk(env, pin) {
  const c = await conf(env);
  const want = c.ACCESS_PIN ? await hashPin(String(c.ACCESS_PIN).trim()) : c.PIN_HASH;
  return !!want && (await hashPin(String(pin || "").trim())) === want;
}
export async function hashPw(pw, saltB64) {
  const salt = saltB64 ? b64uDec(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return { hash: b64u(new Uint8Array(bits)), salt: b64u(salt) };
}
const sha = async (s) => b64u(new Uint8Array(await crypto.subtle.digest("SHA-256", enc(s))));
export async function newSession(env, uid) {
  const tok = b64u(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare("INSERT INTO sessions (th, uid, created, last) VALUES (?1, ?2, ?3, ?3)").bind(await sha(tok), uid, Date.now()).run();
  return tok;
}
const cookieVal = (req) => { const c = (req.headers.get("Cookie") || "").split(/;\s*/).find((x) => x.startsWith(COOKIE + "=")); return c ? c.slice(COOKIE.length + 1) : ""; };
// returns the signed-in user id, or null
export async function authed(req, env) {
  const tok = cookieVal(req); if (!tok || tok.length < 20) return null;
  const r = await env.DB.prepare("SELECT uid, last FROM sessions WHERE th = ?1").bind(await sha(tok)).first();
  if (!r) return null;
  if (Date.now() - r.last > 864e5) await env.DB.prepare("UPDATE sessions SET last = ?2 WHERE th = ?1").bind(await sha(tok), Date.now()).run();
  return r.uid;
}
export async function endSession(req, env) { const tok = cookieVal(req); if (tok) await env.DB.prepare("DELETE FROM sessions WHERE th = ?1").bind(await sha(tok)).run(); }
export function sessionCookie(tok) {
  return tok
    ? `${COOKIE}=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
    : `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
// Google Sign-In: verify the ID token (RS256) against Google's keys; returns its claims or null
let gkeys = null, gkeysAt = 0;
export async function verifyGoogle(env, idToken) {
  const c = await conf(env), aud = c.GOOGLE_CLIENT_ID;
  if (!aud || typeof idToken !== "string") return null;
  const [h, p, s] = idToken.split("."); if (!s) return null;
  const head = JSON.parse(new TextDecoder().decode(b64uDec(h))), claims = JSON.parse(new TextDecoder().decode(b64uDec(p)));
  if (!gkeys || Date.now() - gkeysAt > 3600e3) { gkeys = (await (await fetch("https://www.googleapis.com/oauth2/v3/certs")).json()).keys; gkeysAt = Date.now(); }
  const jwk = gkeys.find((k) => k.kid === head.kid); if (!jwk || head.alg !== "RS256") return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  if (!(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64uDec(s), enc(`${h}.${p}`)))) return null;
  if (claims.aud !== aud || !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss) || claims.exp * 1000 < Date.now()) return null;
  return claims;
}
