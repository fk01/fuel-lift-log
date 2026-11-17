// Meal reminders (cron) and push broadcast

import { REMINDERS, TZ_HOURS } from "./config.js";
import { conf } from "./db.js";
import { sendPush } from "./webpush.js";

export async function remind(env) {
  const now = new Date(Date.now() + TZ_HOURS * 3600e3);
  const date = now.toISOString().slice(0, 10);
  const mins = Math.round((now.getUTCHours() * 60 + now.getUTCMinutes()) / 15) * 15;
  const hhmm = `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  const row = await env.DB.prepare("SELECT value FROM docs WHERE id = ?1").bind("f-" + date).first();
  const day = row ? JSON.parse(row.value) : { done: {}, tags: {} };
  const late = !!(day.tags && day.tags.late);

  for (const r of REMINDERS) {
    const t = late && r.late ? r.late : r.time;
    if (t !== hhmm) continue;
    if (day.done && day.done[r.id]) continue;
    const key = `${date}-${r.id}`;
    const dup = await env.DB.prepare("SELECT 1 FROM sent WHERE key = ?1").bind(key).first();
    if (dup) continue;
    await env.DB.prepare("INSERT INTO sent (key, ts) VALUES (?1, ?2)").bind(key, Date.now()).run();
    await broadcast(env, { title: r.title, body: r.body, url: "/#food", tag: r.id });
  }
  // ล้างประวัติการส่งที่เก่ากว่า 7 วัน
  await env.DB.prepare("DELETE FROM sent WHERE ts < ?1").bind(Date.now() - 7 * 864e5).run();
}

export async function broadcast(env, msg) {
  const c = await conf(env);
  if (!c.VAPID_PUBLIC_KEY || !c.VAPID_PRIVATE_JWK) return 0;
  const { results } = await env.DB.prepare("SELECT endpoint, sub FROM subs").all();
  let n = 0;
  for (const r of results) {
    try {
      const status = await sendPush(c, JSON.parse(r.sub), JSON.stringify(msg));
      if (status === 404 || status === 410) await env.DB.prepare("DELETE FROM subs WHERE endpoint = ?1").bind(r.endpoint).run();
      else if (status < 300) n++;
    } catch (e) { console.log("push error", e); }
  }
  return n;
}
