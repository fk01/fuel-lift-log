// Public routes: PIN login, logout, passkey (Face ID / Touch ID) login
// Returns a Response when the route matches, otherwise null.

import { hashPin, sessionCookie, token } from "../auth.js";
import { conf } from "../db.js";
import { derToRaw, newChallenge, rpOk, useChallenge } from "../passkey.js";
import { limited } from "../ratelimit.js";
import { b64uDec, concat, json } from "../utils.js";

export async function sessionRoutes(req, env, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/login" && m === "POST") {
    if (limited(req, "login", "LOGIN")) return json({ error: "too many attempts" }, 429);
    const { pin } = await req.json().catch(() => ({}));
    const c = await conf(env);
    if (!c.ACCESS_PIN && !c.PIN_HASH) return json({ error: "ACCESS_PIN is not set" }, 500);
    if ((await hashPin(String(pin || "").trim())) !== (await token(env))) return json({ error: "wrong pin" }, 401);
    const tok = await token(env);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(tok) });
  }
  if (p === "/api/logout" && m === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(null) });
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
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(tok) });
  }

  return null;
}
