// Community part 2: comments, activity feed (opt-in), privacy, report, block, admin hide (requires login)
// Returns a Response when the route matches, otherwise null.

import { conf } from "../db.js";
import { json } from "../utils.js";

const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const priv = async (env, uid) => { const r = await env.DB.prepare("SELECT priv FROM users WHERE id = ?1").bind(uid).first(); try { return JSON.parse((r && r.priv) || "{}"); } catch (e) { return {}; } };
export const logActivity = (env, uid, kind, data) => env.DB.prepare("INSERT INTO activity (id, uid, kind, data, created) VALUES (?1, ?2, ?3, ?4, ?5)").bind(newId("a"), uid, kind, JSON.stringify(data), Date.now()).run();
const BLOCKED = "(SELECT bid FROM blocks WHERE uid = ?1 UNION SELECT uid FROM blocks WHERE bid = ?1)";

export async function communityRoutes(req, env, url, uid) {
  const p = url.pathname, m = req.method;
  const admin = (await conf(env)).LEGACY_OWNER === uid;

  // ---- comments ----
  const cm = p.match(/^\/api\/plans\/([\w]{4,40})\/comments$/);
  if (cm) {
    const pid = cm[1], plan = await env.DB.prepare("SELECT uid, hidden FROM plans WHERE id = ?1").bind(pid).first();
    if (!plan || plan.hidden) return json({ error: "not found" }, 404);
    if (m === "GET") {
      const { results } = await env.DB.prepare(`SELECT c.id, c.uid, c.parent, c.body, c.created, u.name FROM comments c JOIN users u ON u.id = c.uid
        WHERE c.pid = ?2 AND c.hidden = 0 AND c.uid NOT IN ${BLOCKED} ORDER BY c.created LIMIT 200`).bind(uid, pid).all();
      return json(results.map((r) => ({ id: r.id, parent: r.parent || null, body: r.body, created: r.created, author: { id: r.uid, name: r.name || "" },
        byOwner: r.uid === plan.uid, canDelete: r.uid === uid || plan.uid === uid || admin })));
    }
    if (m === "POST") {
      const b = await req.json().catch(() => ({})), body = str(b.body, 500).trim();
      if (!body) return json({ error: "empty" }, 400);
      if (await env.DB.prepare("SELECT 1 FROM blocks WHERE uid = ?1 AND bid = ?2").bind(plan.uid, uid).first()) return json({ error: "blocked" }, 403);
      const last = await env.DB.prepare("SELECT MAX(created) t, COUNT(*) n FROM comments WHERE uid = ?1 AND created > ?2").bind(uid, Date.now() - 3600e3).first();
      if ((last.t && Date.now() - last.t < 5000) || last.n >= 60) return json({ error: "slow down" }, 429);
      const parent = b.parent && (await env.DB.prepare("SELECT 1 FROM comments WHERE id = ?1 AND pid = ?2").bind(str(b.parent, 40), pid).first()) ? str(b.parent, 40) : null;
      const id = newId("c");
      await env.DB.prepare("INSERT INTO comments (id, pid, uid, parent, body, created) VALUES (?1, ?2, ?3, ?4, ?5, ?6)").bind(id, pid, uid, parent, body, Date.now()).run();
      return json({ ok: true, id });
    }
  }
  const dc = p.match(/^\/api\/comments\/([\w]{4,40})$/);
  if (dc && m === "DELETE") {
    const c = await env.DB.prepare("SELECT c.uid, p.uid owner FROM comments c JOIN plans p ON p.id = c.pid WHERE c.id = ?1").bind(dc[1]).first();
    if (!c) return json({ error: "not found" }, 404);
    if (c.uid !== uid && c.owner !== uid && !admin) return json({ error: "forbidden" }, 403);
    await env.DB.prepare("UPDATE comments SET hidden = 1 WHERE id = ?1 OR parent = ?1").bind(dc[1]).run();
    return json({ ok: true });
  }

  // ---- activity (only what the person turned on) ----
  if (p === "/api/activity" && m === "POST") {
    const b = await req.json().catch(() => ({})), pv = await priv(env, uid), d = b.data || {};
    if (b.kind === "workout" && pv.acts) {
      const data = { prog: str(d.prog, 60), sets: Math.min(999, +d.sets || 0), mins: Math.min(600, +d.mins || 0), ...(pv.kg ? { vol: Math.min(1e6, Math.round(+d.vol || 0)) } : {}) };
      await logActivity(env, uid, "workout", data); return json({ ok: true, logged: true });
    }
    if (b.kind === "eat" && pv.eat) {
      const day = str(d.day, 10);
      if (await env.DB.prepare("SELECT 1 FROM activity WHERE uid = ?1 AND kind = 'eat' AND data LIKE ?2").bind(uid, `%"day":"${day}"%`).first()) return json({ ok: true, logged: false });
      await logActivity(env, uid, "eat", { day, k: Math.round(+d.k || 0), p: Math.round(+d.p || 0) }); return json({ ok: true, logged: true });
    }
    return json({ ok: true, logged: false });
  }
  if (p === "/api/feed" && m === "GET") {
    const { results } = await env.DB.prepare(`SELECT a.id, a.uid, a.kind, a.data, a.created, u.name FROM activity a JOIN users u ON u.id = a.uid
      WHERE a.uid IN (SELECT fid FROM follows WHERE uid = ?1) AND a.uid NOT IN ${BLOCKED} ORDER BY a.created DESC LIMIT 60`).bind(uid).all();
    return json(results.map((r) => ({ id: r.id, kind: r.kind, data: JSON.parse(r.data), created: r.created, author: { id: r.uid, name: r.name || "" } })));
  }
  if (p === "/api/me/privacy" && m === "PUT") {
    const b = await req.json().catch(() => ({})), v = { acts: !!b.acts, kg: !!b.kg && !!b.acts, eat: !!b.eat };
    await env.DB.prepare("UPDATE users SET priv = ?2 WHERE id = ?1").bind(uid, JSON.stringify(v)).run();
    if (!v.acts) await env.DB.prepare("DELETE FROM activity WHERE uid = ?1 AND kind = 'workout'").bind(uid).run();
    if (!v.eat) await env.DB.prepare("DELETE FROM activity WHERE uid = ?1 AND kind = 'eat'").bind(uid).run();
    return json({ ok: true, privacy: v });
  }

  // ---- report / block ----
  if (p === "/api/report" && m === "POST") {
    const b = await req.json().catch(() => ({}));
    if (!["plan", "comment", "user"].includes(b.kind) || !b.id) return json({ error: "bad report" }, 400);
    const n = await env.DB.prepare("SELECT COUNT(*) n FROM reports WHERE uid = ?1 AND created > ?2").bind(uid, Date.now() - 864e5).first();
    if (n.n >= 20) return json({ error: "slow down" }, 429);
    await env.DB.prepare("INSERT INTO reports (id, uid, kind, target, reason, created) VALUES (?1, ?2, ?3, ?4, ?5, ?6)").bind(newId("r"), uid, b.kind, str(b.id, 40), str(b.reason, 200), Date.now()).run();
    return json({ ok: true });
  }
  const bm = p.match(/^\/api\/people\/([\w]{2,40})\/block$/);
  if (bm && m === "POST") {
    const id = bm[1]; if (id === uid) return json({ error: "self" }, 400);
    const had = await env.DB.prepare("SELECT 1 FROM blocks WHERE uid = ?1 AND bid = ?2").bind(uid, id).first();
    if (had) await env.DB.prepare("DELETE FROM blocks WHERE uid = ?1 AND bid = ?2").bind(uid, id).run();
    else await env.DB.batch([env.DB.prepare("INSERT INTO blocks (uid, bid) VALUES (?1, ?2)").bind(uid, id), env.DB.prepare("DELETE FROM follows WHERE (uid = ?1 AND fid = ?2) OR (uid = ?2 AND fid = ?1)").bind(uid, id)]);
    return json({ ok: true, on: !had });
  }

  // ---- admin (the app owner) ----
  if (p === "/api/admin/reports" && m === "GET") {
    if (!admin) return json({ error: "forbidden" }, 403);
    const { results } = await env.DB.prepare(`SELECT r.id, r.kind, r.target, r.reason, r.created, u.name reporter,
      CASE r.kind WHEN 'plan' THEN (SELECT title FROM plans WHERE id = r.target) WHEN 'comment' THEN (SELECT body FROM comments WHERE id = r.target) ELSE (SELECT name FROM users WHERE id = r.target) END what
      FROM reports r JOIN users u ON u.id = r.uid WHERE r.done = 0 ORDER BY r.created DESC LIMIT 100`).all();
    return json(results);
  }
  if (p === "/api/admin/hide" && m === "POST") {
    if (!admin) return json({ error: "forbidden" }, 403);
    const b = await req.json().catch(() => ({})), id = str(b.id, 40), hide = b.hidden === false ? 0 : 1;
    if (b.kind === "plan") await env.DB.prepare("UPDATE plans SET hidden = ?2 WHERE id = ?1").bind(id, hide).run();
    else if (b.kind === "comment") await env.DB.prepare("UPDATE comments SET hidden = ?2 WHERE id = ?1").bind(id, hide).run();
    if (b.report) await env.DB.prepare("UPDATE reports SET done = 1 WHERE id = ?1").bind(str(b.report, 40)).run();
    return json({ ok: true });
  }
  return null;
}
