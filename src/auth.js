// PIN auth: hashing, session token, cookie check

import { COOKIE } from "./config.js";
import { conf } from "./db.js";
import { b64u, enc } from "./utils.js";

export async function hashPin(pin) {
  const d = await crypto.subtle.digest("SHA-256", enc(`${pin}:fuel-lift-log`));
  return b64u(new Uint8Array(d));
}
export async function token(env) {
  const c = await conf(env);
  return c.ACCESS_PIN ? hashPin(String(c.ACCESS_PIN).trim()) : c.PIN_HASH;
}
export async function authed(req, env) {
  const c0 = await conf(env);
  if (!c0.ACCESS_PIN && !c0.PIN_HASH) return false;
  const c = (req.headers.get("Cookie") || "").split(/;\s*/).find((x) => x.startsWith(COOKIE + "="));
  return !!c && c.slice(COOKIE.length + 1) === (await token(env));
}
export function sessionCookie(tok) {
  return tok
    ? `${COOKIE}=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
    : `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
