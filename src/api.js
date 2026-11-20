// API router: public routes first, then everything that needs a session

import { authed } from "./auth.js";
import { limited } from "./ratelimit.js";
import { docsRoutes } from "./routes/docs.js";
import { passkeyRoutes } from "./routes/passkey.js";
import { pushRoutes } from "./routes/push.js";
import { sessionRoutes } from "./routes/session.js";
import { socialRoutes } from "./routes/social.js";
import { json } from "./utils.js";

const PRIVATE_ROUTES = [passkeyRoutes, docsRoutes, pushRoutes, socialRoutes];

export async function api(req, env, url) {
  const open = await sessionRoutes(req, env, url);
  if (open) return open;

  const uid = await authed(req, env);
  if (!uid) return json({ error: "unauthorized" }, 401);
  if (limited(req, url.pathname, req.method)) return json({ error: "too many requests" }, 429, { "Retry-After": "10" });

  for (const route of PRIVATE_ROUTES) {
    const res = await route(req, env, url, uid);
    if (res) return res;
  }
  return json({ error: "not found" }, 404);
}
