// Smoke test: serves public/ with a fake API (401), opens every tab and main modal on an
// iPhone-sized viewport, and fails on any page error. Run: npm test
const { chromium } = require("playwright");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
(async () => {
const root = path.resolve("public"), types = { js: "text/javascript", css: "text/css", png: "image/png", gif: "image/gif", json: "application/json" };
const srv = http.createServer((q, r) => {
  if (q.url.startsWith("/api")) { r.writeHead(401, { "content-type": "application/json" }); return r.end("{}"); }
  const f = path.join(root, q.url === "/" ? "index.html" : decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": types[f.split(".").pop()] || "text/html" }); r.end(d); });
}).listen(8799);
const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 430, height: 932 } })).newPage(), errs = [];
p.on("pageerror", e => errs.push(e.message));
await p.addInitScript(() => localStorage.setItem("scheme", "4"));
await p.goto("http://localhost:8799/"); await p.waitForTimeout(800);
await p.evaluate(() => (document.getElementById("login").hidden = true));
const steps = [
  ["food", () => (location.hash = "food")], ["gym", () => (location.hash = "gym")],
  ["stats", () => (location.hash = "stats")], ["more", () => (location.hash = "more")],
  ["library", () => openLib()], ["programs", () => { pmOnly = null; renderPM(); document.getElementById("pm-modal").hidden = false; }],
  ["sheet", () => openSheet("push")],
  ["recovery-16", () => { location.hash = "stats"; if (document.querySelectorAll("#rec-card .rec-grid .rec-t").length !== 16) throw new Error("recovery should list 16 muscles"); }],
  ["muscle-sheet", () => { openMuscle("calf"); if (document.getElementById("gen-sheet").hidden || !document.getElementById("gen-body").textContent.includes("program")) throw new Error("muscle sheet"); document.getElementById("gen-sheet").hidden = true; }],
  ["1rm", () => open1RM()], ["badges", () => openBadges()],
];
for (const [name, fn] of steps) { await p.evaluate(fn); await p.waitForTimeout(250); console.log("ok", name); }
await b.close(); srv.close();
if (errs.length) { console.error("FAIL", errs); process.exit(1); }
console.log("PASS");
})();
