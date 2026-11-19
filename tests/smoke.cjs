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
  ["gyms-picker", () => { if (document.getElementById("locpick").hidden || document.querySelectorAll("#locpick .lp-card").length !== 3) throw new Error("picker should show 3 places");
    if (!/ตีแบด|Badminton/.test(document.querySelector("#locpick .lp-card").textContent)) throw new Error("court with today's badminton should be first");
    if (getComputedStyle(document.getElementById("step1")).display !== "none") throw new Error("picker should be full screen");; }],
  ["gyms-condo", () => { pickLoc("condo"); if (!document.getElementById("locpick").hidden) throw new Error("picker should close");
    const ks = weightsHere(); if (ks.length !== 4) throw new Error("condo should have 4 weight programs, got " + ks.length);
    const bad = ks.flatMap(k => PROGS[k].ex).filter(e => !canDo(e)); if (bad.length) throw new Error("condo has machine lifts: " + bad.map(e => e.n));
    if (!/คอนโด|Condo/.test(document.querySelector("#lochead").textContent)) throw new Error("place header"); }],
  ["gyms-cardio", () => { renderToday(); const td = document.getElementById("today");
    if (/ไม่ได้|Not possible|Can't/.test(document.getElementById("v-gym").textContent)) throw new Error("no 'can't' text");
    if (cardioHere().some(k => PROGS[k].tag === "bad")) throw new Error("condo has badminton");
    if (!/เลือกโปรแกรม|Pick a program/.test(td.textContent) || td.querySelector(".loc-chip")) throw new Error("today card at condo on badminton day");
    if (document.querySelectorAll("#v-gym .loc-chip,#v-gym .loc-h").length || !document.querySelector("#lochead b")) throw new Error("place shown once in header");
    openCardioEdit(null); const g = document.getElementById("gen-body"); g.querySelector('[data-f="name"]').value = "Swim"; g.querySelector('[data-f="icon"]').value = "🏊";
    g.querySelector('[data-d="5"]').click(); g.querySelector("[data-save]").click();
    const k = cardioHere().find(q => PROGS[q].name === "Swim"); if (!k || !PROGS[k].days.includes(5)) throw new Error("create cardio program");
    openCardio(k); document.getElementById("run-km").value = "1.5"; document.getElementById("run-time").value = "30:00"; document.getElementById("run-save").click();
    if (!cxGet(k) || cxGet(k).km !== 1.5) throw new Error("log cardio"); cxSet(k, null); delete PROGS[k]; }],
  ["gyms-restday", () => { locDay = {}; const ok = needPick(); if (!ok) throw new Error("rest day should still ask place"); locDay = { date: TODAY, id: curLoc }; }],
  ["gyms-pm-menu", () => { pmOnly = null; renderPM(); document.getElementById("pm-modal").hidden = false; document.querySelector("#pm-body [data-menu]").click();
    if (document.getElementById("gen-sheet").hidden || !document.querySelector('#gen-body [data-m="copy"]')) throw new Error("pm menu"); closeGen(); document.getElementById("pm-modal").hidden = true; }],
  ["gyms-edit", () => { openLocEdit(null); const g = document.getElementById("gen-body"); g.querySelector('[data-f="name"]').value = "Test Gym"; g.querySelector("[data-save]").click();
    if (LOCS.length !== 4) throw new Error("add place"); openLocEdit(LOCS[2].id); const d = document.querySelector("#gen-body [data-del]"); d.click(); d.click(); if (LOCS.length !== 3) throw new Error("delete place"); }],
  ["gyms-copy", () => { pickLoc("gym"); const n = Object.keys(PROGS).length; openProgMove("pull"); document.querySelector("#gen-body [data-go]").click();
    if (Object.keys(PROGS).length !== n + 1 || curLoc !== "condo") throw new Error("copy program"); document.getElementById("pm-modal").hidden = true; pickLoc("gym"); }],
  ["stats", () => (location.hash = "stats")], ["more", () => (location.hash = "more")],
  ["library", () => openLib()], ["programs", () => { pmOnly = null; renderPM(); document.getElementById("pm-modal").hidden = false; }],
  ["sheet", () => openSheet("push")],
  ["recovery-16", () => { location.hash = "stats"; if (document.querySelectorAll("#rec-card .rec-grid .rec-t").length !== 16) throw new Error("recovery should list 16 muscles"); }],
  ["muscle-sheet", () => { openMuscle("calf"); if (document.getElementById("gen-sheet").hidden || !document.getElementById("gen-body").textContent.includes("program")) throw new Error("muscle sheet"); document.getElementById("gen-sheet").hidden = true; }],
  ["no-inline-gif", () => { openSheet("push"); const n = document.querySelectorAll('#prog-sheet img[src$=".gif"]').length; document.getElementById("prog-sheet").hidden = true; openLib(); const m = document.querySelectorAll('#lib-list img[src$=".gif"]').length; document.getElementById("lib-modal").hidden = true; if (n || m) throw new Error("inline gif found"); }],
  ["howto", () => { openHowTo("chest-press", "Chest Press Machine"); document.getElementById("gen-sheet").hidden = true; }],
  ["review-ui", () => { location.hash = "more"; if (document.querySelectorAll("#v-more .grp-h").length !== 3) throw new Error("more groups");
    document.getElementById("loc-open").click(); if (!document.querySelector("#gen-body [data-pladd]")) throw new Error("places sheet"); closeGen();
    openHowTo("chest-press", "Chest Press Machine"); if (!document.querySelector("#gen-body .sh-x") || !document.querySelector("#gen-body .sticky-b")) throw new Error("how-to close"); closeGen();
    location.hash = "stats"; renderBody(); if (!document.querySelector("#body-card .card-h #bw-add.primary") || !document.querySelector("#body-card .segc")) throw new Error("body card"); }],
  ["food-log", () => { location.hash = "food"; const before = dayP(DAY) || 0; document.getElementById("food-add").click();
    const g = document.getElementById("gen-body"); g.querySelector("#fl-n").value = "ข้าวมันไก่"; g.querySelector("#fl-k").value = "600"; g.querySelector("#fl-p").value = "25";
    g.querySelector('[data-q="2"]').click(); g.querySelector('[data-s="m2"]').click(); g.querySelector("#fl-save").click();
    if (dayP(DAY) !== before + 50) throw new Error("protein total should include entry ×2");
    if (!document.querySelector("#meals .flog-row")) throw new Error("entry row");
    document.getElementById("food-add").click(); if (!document.querySelector("#gen-body .flog-rec [data-r]")) throw new Error("recent foods"); closeGen();
    document.querySelector("#meals .flog-row").click(); const d = document.querySelector("#gen-body #fl-del"); d.click(); d.click(); if (logOf(DAY).length) throw new Error("delete entry"); }],
  ["1rm", () => open1RM()], ["badges", () => openBadges()],
];
for (const [name, fn] of steps) { await p.evaluate(fn); await p.waitForTimeout(250); console.log("ok", name); }
await b.close(); srv.close();
if (errs.length) { console.error("FAIL", errs); process.exit(1); }
console.log("PASS");
})();
