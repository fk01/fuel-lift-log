// Fuel & Lift Log — Cloudflare Worker (static assets + D1 API + Web Push reminders)

import { api } from "./api.js";
import { init } from "./db.js";
import { remind } from "./reminders.js";
import { json } from "./utils.js";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        await init(env);
        return await api(req, env, url);
      } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(init(env).then(() => remind(env)));
  },
};
