// WebAuthn helpers: challenges, RP ID check, signature format

import { b64u, concat, enc } from "./utils.js";

export async function newChallenge(env, kind) {
  const c = b64u(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM challenges WHERE ts < ?1").bind(Date.now() - 5 * 60e3),
    env.DB.prepare("INSERT INTO challenges (c, kind, ts) VALUES (?1, ?2, ?3)").bind(c, kind, Date.now()),
  ]);
  return c;
}
export async function useChallenge(env, c, kind) {
  const r = await env.DB.prepare("DELETE FROM challenges WHERE c = ?1 AND kind = ?2 AND ts > ?3 RETURNING c").bind(c, kind, Date.now() - 5 * 60e3).first();
  return !!r;
}
export async function rpOk(ad, host) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc(host)));
  for (let i = 0; i < 32; i++) if (ad[i] !== h[i]) return false;
  return true;
}
export function derToRaw(der) {
  // ECDSA DER (SEQUENCE{INTEGER r, INTEGER s}) -> 64-byte r||s
  let o = 2; if (der[1] & 0x80) o += der[1] & 0x7f;
  const read = () => { o++; const len = der[o++]; let v = der.slice(o, o + len); o += len; while (v.length > 32 && v[0] === 0) v = v.slice(1); const out = new Uint8Array(32); out.set(v, 32 - v.length); return out; };
  return concat(read(), read());
}
