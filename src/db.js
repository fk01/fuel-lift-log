// D1 access: schema bootstrap and config lookup

let ready = false;
// ค่าตั้งเก็บใน D1 (ตาราง config) ใช้แทน Secret ใน Dashboard ได้ — Secret ใน Dashboard ถ้ามีจะมีผลก่อน
export async function conf(env) {
  if (env.__conf) return env.__conf;
  const out = {};
  try { const { results } = await env.DB.prepare("SELECT k, v FROM config").all(); for (const r of results) out[r.k] = r.v; } catch (e) {}
  for (const k of ["ACCESS_PIN", "PIN_HASH", "GOOGLE_CLIENT_ID", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_JWK", "VAPID_SUBJECT"]) if (env[k]) out[k] = env[k];
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
    env.DB.prepare("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, name TEXT, pw TEXT, salt TEXT, gsub TEXT UNIQUE, created INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (th TEXT PRIMARY KEY, uid TEXT NOT NULL, created INTEGER NOT NULL, last INTEGER NOT NULL)"),
    // per-user documents; the old single-user table "docs" stays untouched until its owner claims it (it is copied, not moved)
    env.DB.prepare("CREATE TABLE IF NOT EXISTS udocs (uid TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY (uid, id))"),
  ]);
  for (const t of ["creds", "subs"]) { try { await env.DB.prepare(`ALTER TABLE ${t} ADD COLUMN uid TEXT`).run(); } catch (e) {} }
  ready = true;
}
