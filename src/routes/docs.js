// Document store and JSON import (requires login)
// Returns a Response when the route matches, otherwise null.

import { json } from "../utils.js";

export async function docsRoutes(req, env, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/docs" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT id, value FROM docs").all();
    return json(results.map((r) => ({ id: r.id, value: JSON.parse(r.value) })));
  }
  const dm = p.match(/^\/api\/docs\/(.+)$/);
  if (dm) {
    const id = decodeURIComponent(dm[1]);
    if (!/^[\w.\-]{1,80}$/.test(id)) return json({ error: "bad id" }, 400);
    if (m === "PUT") {
      const body = await req.text();
      if (body.length > 900_000) return json({ error: "too large" }, 413);
      JSON.parse(body);
      await env.DB.prepare("INSERT INTO docs (id, value, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET value = ?2, updated = ?3")
        .bind(id, body, Date.now()).run();
      return json({ ok: true });
    }
    if (m === "DELETE") {
      await env.DB.prepare("DELETE FROM docs WHERE id = ?1").bind(id).run();
      return json({ ok: true });
    }
  }
  if (p === "/api/import" && m === "POST") {
    const data = await req.json();
    const stmts = [];
    const put = (id, v) => stmts.push(env.DB.prepare("INSERT INTO docs (id, value, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET value = ?2, updated = ?3").bind(id, JSON.stringify(v), Date.now()));
    for (const [date, v] of Object.entries(data.food || {})) if (/^\d{4}-\d\d-\d\d$/.test(date)) put("f-" + date, { date, ...v });
    for (const l of data.gymLogs || []) put(`g-${l.date}-${l.prog}`, l);
    if (data.programs || data.restSettings) put("settings", { restCfg: data.restSettings || {}, draft: {}, progs: data.programs, lib: data.exerciseLibrary, unit: data.displayUnit || "kg", scheme: 3 });
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true, imported: stmts.length });
  }

  return null;
}
