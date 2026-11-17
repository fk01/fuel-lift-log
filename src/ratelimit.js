// Rate limit (per isolate, per IP)

const hits = new Map();
export function limited(req, path, method) {
  const ip = req.headers.get("CF-Connecting-IP") || "x";
  const key = `${ip}|${method}`;
  const now = Date.now(), win = 60e3, max = method === "GET" ? 30 : method === "LOGIN" ? 10 : 120;
  const arr = (hits.get(key) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > max;
}
