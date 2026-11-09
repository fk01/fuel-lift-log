// สร้างคีย์ VAPID สำหรับ Web Push: node scripts/gen-vapid.mjs
const { subtle } = globalThis.crypto;
const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const raw = new Uint8Array(await subtle.exportKey("raw", kp.publicKey));
const jwk = await subtle.exportKey("jwk", kp.privateKey);
const b64u = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
console.log("VAPID_PUBLIC_KEY=" + b64u(raw));
console.log("VAPID_PRIVATE_JWK=" + JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d }));
