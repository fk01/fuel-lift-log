// Community: shared plans (workout / meal), likes, saves, "use" counts, people search, profiles, follows (requires login)
// Returns a Response when the route matches, otherwise null.

import { json } from "../utils.js";
import { logActivity } from "./community.js";

const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const newId = () => "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const cleanTags = (t) => (Array.isArray(t) ? t : []).map((x) => str(x, 24).trim()).filter(Boolean).slice(0, 8);
const LIST = `SELECT p.id, p.uid, p.kind, p.title, p.descr, p.tags, p.summary, p.likes, p.uses, p.created, p.updated, u.name author,
  EXISTS(SELECT 1 FROM likes l WHERE l.pid = p.id AND l.uid = ?1) liked, EXISTS(SELECT 1 FROM saves s WHERE s.pid = p.id AND s.uid = ?1) saved
  FROM plans p JOIN users u ON u.id = p.uid WHERE p.hidden = 0 AND p.uid NOT IN (SELECT bid FROM blocks WHERE uid = ?1 UNION SELECT uid FROM blocks WHERE bid = ?1)`;
const row = (r) => ({ id: r.id, kind: r.kind, title: r.title, desc: r.descr || "", tags: JSON.parse(r.tags || "[]"), summary: r.summary || "", likes: r.likes, uses: r.uses,
  author: { id: r.uid, name: r.author || "" }, liked: !!r.liked, saved: !!r.saved, mine: false, created: r.created, updated: r.updated });

export async function socialRoutes(req, env, url, uid) {
  const p = url.pathname, m = req.method, q = url.searchParams;

  // ---- plans ----
  if (p === "/api/plans" && m === "GET") {
    const where = [], args = [uid];
    const kind = q.get("kind"); if (kind === "workout" || kind === "meal") { args.push(kind); where.push(`p.kind = ?${args.length}`); }
    const s = str(q.get("q"), 60).trim().toLowerCase(); if (s) { args.push(`%${s}%`); where.push(`(lower(p.title) LIKE ?${args.length} OR lower(p.tags) LIKE ?${args.length} OR lower(u.name) LIKE ?${args.length})`); }
    const by = q.get("by"); if (by) { args.push(str(by, 40)); where.push(`p.uid = ?${args.length}`); }
    if (q.get("saved")) where.push("EXISTS(SELECT 1 FROM saves s2 WHERE s2.pid = p.id AND s2.uid = ?1)");
    if (q.get("following")) where.push("p.uid IN (SELECT fid FROM follows WHERE uid = ?1)");
    const order = q.get("sort") === "new" ? "p.updated DESC" : "(p.likes * 2 + p.uses * 3) DESC, p.updated DESC";
    const { results } = await env.DB.prepare(`${LIST}${where.length ? " AND " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT 50`).bind(...args).all();
    return json(results.map((r) => ({ ...row(r), mine: r.uid === uid })));
  }
  if (p === "/api/plans" && m === "POST") {
    const b = await req.json().catch(() => ({})), data = JSON.stringify(b.data || {});
    if (!["workout", "meal"].includes(b.kind) || !str(b.title, 80).trim()) return json({ error: "bad plan" }, 400);
    if (data.length > 60000) return json({ error: "too large" }, 413);
    const mine = await env.DB.prepare("SELECT COUNT(*) n FROM plans WHERE uid = ?1").bind(uid).first();
    if (mine.n >= 30) return json({ error: "too many plans" }, 429);
    const id = newId(), now = Date.now();
    await env.DB.prepare("INSERT INTO plans (id, uid, kind, title, descr, tags, summary, data, created, updated) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)")
      .bind(id, uid, b.kind, str(b.title, 80).trim(), str(b.desc, 500), JSON.stringify(cleanTags(b.tags)), str(b.summary, 120), data, now).run();
    await logActivity(env, uid, "share", { pid: id, title: str(b.title, 80).trim(), kind: b.kind });
    return json({ ok: true, id });
  }
  const pm = p.match(/^\/api\/plans\/([\w]{4,40})(\/(like|save|use))?$/);
  if (pm) {
    const id = pm[1], act = pm[3];
    const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?1").bind(id).first();
    if (!plan || (plan.hidden && plan.uid !== uid)) return json({ error: "not found" }, 404);
    if (!act && m === "GET") {
      const r = await env.DB.prepare(`${LIST} AND p.id = ?2`).bind(uid, id).first();
      return json({ ...row(r || { ...plan, author: "" }), mine: plan.uid === uid, data: JSON.parse(plan.data) });
    }
    if (!act && m === "PUT") {
      if (plan.uid !== uid) return json({ error: "forbidden" }, 403);
      const b = await req.json().catch(() => ({})), data = JSON.stringify(b.data || JSON.parse(plan.data));
      if (data.length > 60000) return json({ error: "too large" }, 413);
      await env.DB.prepare("UPDATE plans SET title = ?2, descr = ?3, tags = ?4, summary = ?5, data = ?6, updated = ?7 WHERE id = ?1")
        .bind(id, str(b.title || plan.title, 80).trim(), str(b.desc ?? plan.descr, 500), JSON.stringify(cleanTags(b.tags || JSON.parse(plan.tags || "[]"))), str(b.summary ?? plan.summary, 120), data, Date.now()).run();
      await logActivity(env, uid, "update", { pid: id, title: str(b.title || plan.title, 80).trim(), kind: plan.kind });
      return json({ ok: true });
    }
    if (!act && m === "DELETE") {
      if (plan.uid !== uid) return json({ error: "forbidden" }, 403);
      await env.DB.batch([env.DB.prepare("DELETE FROM plans WHERE id = ?1").bind(id), env.DB.prepare("DELETE FROM likes WHERE pid = ?1").bind(id), env.DB.prepare("DELETE FROM saves WHERE pid = ?1").bind(id)]);
      return json({ ok: true });
    }
    if (act && m === "POST") {
      if (act === "use") { await env.DB.prepare("UPDATE plans SET uses = uses + 1 WHERE id = ?1").bind(id).run(); return json({ ok: true }); }
      const t = act === "like" ? "likes" : "saves";
      const had = await env.DB.prepare(`SELECT 1 FROM ${t} WHERE uid = ?1 AND pid = ?2`).bind(uid, id).first();
      if (had) await env.DB.prepare(`DELETE FROM ${t} WHERE uid = ?1 AND pid = ?2`).bind(uid, id).run();
      else if (t === "likes") await env.DB.prepare("INSERT INTO likes (uid, pid) VALUES (?1, ?2)").bind(uid, id).run();
      else await env.DB.prepare("INSERT INTO saves (uid, pid, created) VALUES (?1, ?2, ?3)").bind(uid, id, Date.now()).run();
      if (t === "likes") await env.DB.prepare("UPDATE plans SET likes = (SELECT COUNT(*) FROM likes WHERE pid = ?1) WHERE id = ?1").bind(id).run();
      return json({ ok: true, on: !had });
    }
  }

  // ---- people ----
  const PEOPLE = `SELECT u.id, u.name, u.bio, (SELECT COUNT(*) FROM plans x WHERE x.uid = u.id AND x.hidden = 0) plans,
    (SELECT COUNT(*) FROM follows f WHERE f.fid = u.id) followers, (SELECT COUNT(*) FROM follows f WHERE f.uid = u.id) following_n,
    EXISTS(SELECT 1 FROM follows f WHERE f.uid = ?1 AND f.fid = u.id) following FROM users u`;
  const person = (r) => ({ id: r.id, name: r.name || "", bio: r.bio || "", plans: r.plans, followers: r.followers, followingCount: r.following_n, following: !!r.following, me: r.id === uid });
  if (p === "/api/people" && m === "GET") {
    const s = str(q.get("q"), 60).trim().toLowerCase(), args = [uid];
    let sql = PEOPLE + " WHERE u.id != ?1 AND u.id NOT IN (SELECT bid FROM blocks WHERE uid = ?1)";
    if (s) { args.push(`%${s}%`); sql += " AND lower(coalesce(u.name, '')) LIKE ?2"; } else sql += " AND EXISTS(SELECT 1 FROM plans x WHERE x.uid = u.id AND x.hidden = 0)";
    if (q.get("following")) sql += " AND u.id IN (SELECT fid FROM follows WHERE uid = ?1)";
    const { results } = await env.DB.prepare(sql + " ORDER BY followers DESC, plans DESC LIMIT 50").bind(...args).all();
    return json(results.map(person));
  }
  const um = p.match(/^\/api\/people\/([\w]{2,40})(\/follow)?$/);
  if (um) {
    const id = um[1];
    const r = await env.DB.prepare(PEOPLE + " WHERE u.id = ?2").bind(uid, id).first();
    if (!r) return json({ error: "not found" }, 404);
    if (um[2] && m === "POST") {
      if (id === uid) return json({ error: "self" }, 400);
      if (r.following) await env.DB.prepare("DELETE FROM follows WHERE uid = ?1 AND fid = ?2").bind(uid, id).run();
      else await env.DB.prepare("INSERT INTO follows (uid, fid, created) VALUES (?1, ?2, ?3)").bind(uid, id, Date.now()).run();
      return json({ ok: true, on: !r.following });
    }
    if (!um[2] && m === "GET") { const bl = await env.DB.prepare("SELECT 1 FROM blocks WHERE uid = ?1 AND bid = ?2").bind(uid, id).first(); return json({ ...person(r), blocked: !!bl }); }
  }
  if (p === "/api/me/profile" && m === "PUT") {
    const b = await req.json().catch(() => ({}));
    const name = str(b.name, 40).trim(); if (!name) return json({ error: "name required" }, 400);
    await env.DB.prepare("UPDATE users SET name = ?2, bio = ?3 WHERE id = ?1").bind(uid, name, str(b.bio, 160)).run();
    return json({ ok: true });
  }
  return null;
}
