// D1 access: schema bootstrap and config lookup

let ready = false;
// ค่าตั้งเก็บใน D1 (ตาราง config) ใช้แทน Secret ใน Dashboard ได้ — Secret ใน Dashboard ถ้ามีจะมีผลก่อน
export async function conf(env) {
  if (env.__conf) return env.__conf;
  const out = {};
  try { const { results } = await env.DB.prepare("SELECT k, v FROM config").all(); for (const r of results) out[r.k] = r.v; } catch (e) {}
  for (const k of ["ACCESS_PIN", "PIN_HASH", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_JWK", "VAPID_SUBJECT"]) if (env[k]) out[k] = env[k];
  env.__conf = out;
  return out;
}
export async function init(env) {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, value TEXT NOT NULL, updated INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS subs (endpoint TEXT PRIMARY KEY, sub TEXT NOT NULL, created INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sent (key TEXT PRIMARY KEY, ts INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS creds (id TEXT PRIMARY KEY, pk TEXT NOT NULL, alg INTEGER NOT NULL, name TEXT, created INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS challenges (c TEXT PRIMARY KEY, kind TEXT NOT NULL, ts INTEGER NOT NULL)"),
  ]);
  ready = true;
}
