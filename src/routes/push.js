// Push subscription routes (requires login)
// Returns a Response when the route matches, otherwise null.

import { conf } from "../db.js";
import { broadcast } from "../reminders.js";
import { json } from "../utils.js";

export async function pushRoutes(req, env, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/push/key" && m === "GET") return json({ key: (await conf(env)).VAPID_PUBLIC_KEY || "" });
  if (p === "/api/push/subscribe" && m === "POST") {
    const sub = await req.json();
    if (!sub || !sub.endpoint || !sub.keys) return json({ error: "bad subscription" }, 400);
    await env.DB.prepare("INSERT INTO subs (endpoint, sub, created) VALUES (?1, ?2, ?3) ON CONFLICT(endpoint) DO UPDATE SET sub = ?2")
      .bind(sub.endpoint, JSON.stringify(sub), Date.now()).run();
    return json({ ok: true });
  }
  if (p === "/api/push/unsubscribe" && m === "POST") {
    const { endpoint } = await req.json().catch(() => ({}));
    if (endpoint) await env.DB.prepare("DELETE FROM subs WHERE endpoint = ?1").bind(endpoint).run();
    return json({ ok: true });
  }
  if (p === "/api/push/test" && m === "POST") {
    const n = await broadcast(env, { title: "✅ Fuel & Lift", body: "การแจ้งเตือนใช้งานได้แล้ว", url: "/" });
    return json({ ok: true, sent: n });
  }

  return null;
}
