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
// pin the clock to a Thursday (badminton day in the default schedule) so date-based steps are stable
await p.addInitScript(() => { const T0 = new Date("2026-11-19T10:00:00").getTime(), real = Date.now(), R = Date;
  class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
  window.Date = D; localStorage.setItem("scheme", "4"); });
await p.goto("http://localhost:8799/"); await p.waitForTimeout(800);
await p.evaluate(() => (document.getElementById("login").hidden = true));
const steps = [
  ["food", () => (location.hash = "food")], ["gym", () => (location.hash = "gym")],
  ["day-pick", () => { if (!document.querySelectorAll("#locpick [data-dm],#locpick [data-pl]").length) throw new Error("first screen should ask what today");
    (document.querySelector('#locpick [data-dm="rest"]') || document.querySelector("#locpick [data-plrest]")).click(); renderToday(); if (!document.getElementById("v-gym").classList.contains("resting") || !/พักวันนี้|Resting/.test(document.getElementById("today").textContent)) throw new Error("rest mode");
    document.querySelector('#today [data-today="train"]').click(); dayKind = {}; save("daykind", dayKind); renderGym(); }],
  ["gyms-picker", () => { if (document.getElementById("locpick").hidden || document.querySelectorAll("#locpick .lp-card").length !== 3) throw new Error("picker should show 3 places");
    if (getComputedStyle(document.getElementById("step1")).display !== "none") throw new Error("picker should be full screen");; }],
  ["gyms-condo", () => { pickLoc("condo"); if (!document.getElementById("locpick").hidden) throw new Error("picker should close");
    const ks = weightsHere(); if (ks.length !== 4) throw new Error("condo should have 4 weight programs, got " + ks.length);
    const bad = ks.flatMap(k => PROGS[k].ex).filter(e => !canDo(e)); if (bad.length) throw new Error("condo has machine lifts: " + bad.map(e => e.n));
    if (!/คอนโด|Condo/.test(document.querySelector("#lochead").textContent)) throw new Error("place header"); }],
  ["gyms-cardio", () => { renderToday(); const td = document.getElementById("today");
    if (/ไม่ได้|Not possible|Can't/.test(document.getElementById("v-gym").textContent)) throw new Error("no 'can't' text");
    if (Object.keys(PROGS).filter(k => PROGS[k].tag === "run").length !== 1) throw new Error("one run program for all places");
    if (!td.hidden || !/เลือกโปรแกรม|Pick a program/.test(document.getElementById("lochead").textContent)) throw new Error("condo on badminton day: card hidden, chip asks to pick");
    if (document.querySelectorAll("#v-gym .loc-chip,#v-gym .loc-h").length || !document.querySelector("#lochead .crumbs")) throw new Error("place shown once in header");
    openCardioEdit(null); const g = document.getElementById("gen-body"); g.querySelector('[data-f="name"]').value = "Swim"; g.querySelector('[data-f="icon"]').value = "🏊";
    g.querySelector('[data-d="5"]').click(); g.querySelector("[data-save]").click();
    const k = cardioHere().find(q => PROGS[q].name === "Swim"); if (!k || !PROGS[k].days.includes(5)) throw new Error("create cardio program");
    openCardio(k); document.getElementById("run-km").value = "1.5"; document.getElementById("run-time").value = "30:00"; document.getElementById("run-save").click();
    if (!cxGet(k) || cxGet(k).km !== 1.5) throw new Error("log cardio"); cxSet(k, null); delete PROGS[k]; }],
  ["gyms-restday", () => { setDayMode(null); locDay = {}; if (!needDay()) throw new Error("fresh day asks train/rest"); setDayMode("train"); locDay = { date: TODAY, id: curLoc }; }],
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
  ["recovery-pct", () => { const d = new Date(Date.now() - 24 * 36e5); logs.push({ date: TODAY, prog: "push", ex: { "incline-db": [{ kg: 20, reps: 5 }, { kg: 20, reps: 5 }, { kg: 20, reps: 5 }, { kg: 20, reps: 5 }, { kg: 20, reps: 5 }] }, names: {}, at: d.getTime() });
    const R = recPct(); if (!(R.chest && R.chest.pct >= 30 && R.chest.pct <= 36)) throw new Error("chest 24h/72h ≈ 33%, got " + (R.chest && R.chest.pct));
    location.hash = "stats"; renderRecovery(); if (!document.querySelector("#rec-card .rec-bar")) throw new Error("bars");
    openMuscle("chest"); if (!/%/.test(document.querySelector("#gen-body .msh-st").textContent)) throw new Error("sheet pct"); closeGen(); logs.pop(); }],
  ["body-stepper", () => { BODY = [{ d: "2026-11-10", kg: 76.1, mm: 34 }]; location.hash = "stats"; renderBody(); document.getElementById("bw-add").click();
    const g = document.getElementById("gen-body"), m = g.querySelector('[data-st="-"][data-for="b-kg"]'); for (let i = 0; i < 3; i++) { m.dispatchEvent(new PointerEvent("pointerdown")); m.dispatchEvent(new PointerEvent("pointerup")); }
    if (g.querySelector("#b-kg").value !== "75.8") throw new Error("stepper value " + g.querySelector("#b-kg").value);
    g.querySelector("#b-save").click(); const r = BODY.find(x => x.d === TODAY); if (!r || r.kg !== 75.8 || r.mm != null) throw new Error("saved only touched field"); BODY = []; save("body", BODY); }],
  ["lib-grid", () => { openLib(); document.querySelector('[data-lv="grid"]').click(); if (!document.getElementById("lib-list").classList.contains("lib-grid")) throw new Error("grid");
    if (document.querySelectorAll("#lib-list .lib-row").length < 6) throw new Error("cards"); document.querySelector('[data-lv="list"]').click(); document.getElementById("lib-modal").hidden = true; }],
  ["no-dup-court", () => { const n = LOCS.length; for (let i = 0; i < 3; i++) { ensureLocs(); ensureV3(); } if (LOCS.length !== n) throw new Error("places grew on reload: " + n + " → " + LOCS.length);
    LOCS.push({ ...LOCS[LOCS.length - 1] }); ensureLocs(); if (LOCS.length !== n || new Set(LOCS.map(l => l.id)).size !== n) throw new Error("duplicate not removed"); }],
  ["crumbs", () => { location.hash = "gym"; setDayMode("train"); pickLoc("gym"); renderGym(); const h = document.getElementById("lochead");
    if ((!planDone() && !h.querySelector('[data-cr="mode"]')) || !h.querySelector('[data-cr="place"]')) throw new Error("crumbs on place page");
    const saved = logs.filter(l => l.date === TODAY); logs = logs.filter(l => l.date !== TODAY); const tg = fs().tags; const keep = { run: tg.run, bad: tg.bad, cx: tg.cx }; tg.run = tg.bad = false; tg.cx = {}; renderGym();
    h.querySelector('[data-cr="place"]').click(); if (!document.querySelector('#locpick [data-cr="mode"]')) throw new Error("crumbs on picker");
    document.querySelector('#locpick [data-cr="mode"]').click(); if (!document.querySelector("#locpick [data-pladd]")) throw new Error("back to today's list");
    document.querySelector("#locpick [data-plrest]").click(); renderLocHead(); if (!/พัก|Rest/.test(h.textContent) || !h.querySelector('.cr.cur')) throw new Error("rest crumb");
    setDayMode("train"); pickLoc("gym"); logs.push(...saved); Object.assign(tg, keep); }],
  ["crumb-program", () => { location.hash = "gym"; setDayMode("train"); pickLoc("gym"); const saved = logs.filter(l => l.date === TODAY); logs = logs.filter(l => l.date !== TODAY); renderGym();
    renderToday(); if (!selProg() && !document.getElementById("today").hidden) throw new Error("no card before a program is picked");
    const chip = document.querySelector('#lochead [data-cr="prog"]'); if (!chip) throw new Error("program chip"); chip.click();
    const k = weightsHere()[1]; document.querySelector(`#gen-body [data-pp="${k}"]`).click(); renderToday();
    if (!document.querySelector("#lochead").textContent.includes(PROGS[k].name) || !document.querySelector('#today [data-today="start:' + k + '"]')) throw new Error("chosen program on chip + today");
    logs.push(...saved); }],
  ["no-emoji", () => { ["food", "gym", "stats", "more"].forEach(h => { location.hash = h; }); deEmoji(document.body);
    const txt = document.body.innerText; const m = txt.match(/\p{Extended_Pictographic}/u); if (m && !/[✓✕✎☰↗★⚠]/.test(m[0])) throw new Error("emoji left: " + m[0]);
    if (getComputedStyle(document.getElementById("hero")).display !== "none") throw new Error("level character should be hidden"); }],
  ["day-queue", () => { location.hash = "gym"; const saved = logs.filter(l => l.date === TODAY); logs = logs.filter(l => l.date !== TODAY); cancelProg(); setDayMode(null); dayPlan = {}; renderGym();
    openPlanAdd(); document.querySelector('#gen-body [data-padd="pull"]').click(); document.querySelector('#gen-body [data-padd="push2"]').click(); document.querySelector("#gen-body [data-pgo]").click();
    if (!document.querySelector('#locpick [data-pl="push2"]')) throw new Error("multi-select adds both"); const row = document.querySelector('#locpick [data-pl="pull"]'); if (!row || !row.classList.contains("st-pend")) throw new Error("added row pending");
    row.querySelector('[data-plgo="start"]').click(); if (!picked || cur !== "pull") throw new Error("start from list");
    setDayMode(null); renderGym(); if (!document.querySelector('#locpick [data-pl="pull"].st-prog')) throw new Error("in progress row");
    cancelProg(); setDayMode(null); renderGym(); document.querySelector('#locpick [data-pl="pull"] [data-pldel]').click(); if (document.querySelector('#locpick [data-pl="pull"]')) throw new Error("remove row");
    logs.push(...saved); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["plan-multi", () => { location.hash = "gym"; const run = Object.keys(PROGS).find(k => PROGS[k].tag === "run"), wd = new Date(TODAY + "T12:00:00").getDay();
    const keep = { r: PROGS[run].days.slice(), p: PROGS.push.days.slice() }; PROGS[run].days.push(wd); PROGS.push.days.push(wd);
    const saved = logs.filter(l => l.date === TODAY); logs = logs.filter(l => l.date !== TODAY); const tg = fs().tags, kt = { run: tg.run, runData: tg.runData, bad: tg.bad }; tg.run = tg.bad = false;
    setDayMode(null); renderGym(); const rows = document.querySelectorAll("#locpick [data-pl]"); if (rows.length < 2) throw new Error("plan rows " + rows.length);
    document.querySelector(`#locpick [data-pl="${run}"]`).click(); 
    cxSet(run, { km: 5, sec: 1800 }); setDayMode(null); renderGym(); if (!document.querySelector(`#locpick [data-pl="${run}"].st-done`)) throw new Error("done row");
    PROGS[run].days = keep.r; PROGS.push.days = keep.p; cxSet(run, null); Object.assign(tg, kt); logs.push(...saved); setDayMode("train"); pickLoc("gym"); }],
  ["pick-after-cardio", () => { location.hash = "gym"; dayKind = { date: TODAY, k: "cardio" }; setDayMode("train"); pickLoc("gym"); renderGym();
    document.querySelector('#lochead [data-cr="prog"]').click(); const b = document.querySelector('#gen-body [data-pp="push"]'); if (!b) throw new Error("weights must be pickable after cardio"); b.click(); renderToday();
    if (!document.querySelector('#today [data-today="start:push"]')) throw new Error("start button"); dayKind = {}; }],
  ["card-start", () => { document.querySelectorAll(".modal").forEach(m => m.hidden = true); location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); const g = document.querySelector("#p-push [data-go]"); if (!g) throw new Error("start button on card");
    const r = g.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!hit || !hit.closest("[data-go]")) throw new Error("start button is covered by " + (hit && hit.className)); hit.click();
    if (!picked || cur !== "push") throw new Error("card start"); cancelProg(); }],
  ["hit-areas", () => { document.querySelectorAll(".modal,#gen-sheet,#prog-sheet").forEach(m => m.hidden = true); location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); scrollAppTop();
    const bad = [...document.querySelectorAll("#v-gym button,#v-gym [role=button]")].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || r.top < 0 || r.bottom > innerHeight - 100) return false;
      const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && h !== e && !e.contains(h) && !h.closest(".wo-top"); });
    if (bad.length) throw new Error("covered buttons: " + bad.map(e => e.className + "|" + e.textContent.trim().slice(0, 15)).join(", ")); }],
  ["figure-layers", () => { setDayMode(null); renderGym(); openMuscle("delt"); const bad = [...document.querySelectorAll(".body-fig")].filter(f => new Set([...f.children].map(c => { const r = c.getBoundingClientRect(); return [r.width, r.height, r.left, r.top].map(Math.round).join() })).size > 1);
    closeGen(); if (bad.length) throw new Error(bad.length + " muscle figures have misaligned colour layers"); }],
  ["rec-palette", () => { location.hash = "more"; document.getElementById("pal-open").click(); const r = document.querySelector('#gen-body [data-pal="app"]'); if (!r) throw new Error("palette sheet"); r.click();
    if (REC_C[3] !== "#3dff8c") throw new Error("palette applied"); document.querySelector('#gen-body [data-pal="heat"]').click(); closeGen(); }],
  ["create-from-today", () => { location.hash = "gym"; cancelProg(); setDayMode(null); dayPlan = {}; renderGym(); openPlanAdd(); const n = document.querySelector("#gen-body [data-pnew]"); if (!n) throw new Error("create button");
    const before = Object.keys(PROGS).length; addToToday = true; newWeights(); document.getElementById("pm-modal").hidden = true; const k = Object.keys(PROGS).find(q => !(q in {}) && dp().add.includes(q));
    if (Object.keys(PROGS).length !== before + 1 || !k) throw new Error("new program added to today"); delete PROGS[k]; dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["untick-in-sheet", () => { location.hash = "gym"; cancelProg(); dayPlan = {}; planAdd("pull"); setDayMode(null); renderGym(); openPlanAdd(); const r = document.querySelector('#gen-body [data-padd="pull"]');
    if (r.disabled || !r.classList.contains("sel")) throw new Error("added row should be ticked and tappable"); r.click(); document.querySelector("#gen-body [data-pgo]").click();
    if (planList().includes("pull")) throw new Error("untick removes from today"); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["cardio-anywhere", () => { location.hash = "gym"; const run = Object.keys(PROGS).find(k => PROGS[k].tag === "run"); if (locOf(PROGS[run]) !== "*") throw new Error("cardio not tied to a place");
    const tg = fs().tags, kt = { run: tg.run, runData: tg.runData, runLoc: tg.runLoc }; openCardio(run); const w = document.querySelector("#run-modal .cw"); if (!w) throw new Error("where row");
    w.querySelector("[data-cwnew]").click(); w.querySelector(".cw-new input").value = "Park"; w.querySelector(".cw-new .btn").click();
    const park = LOCS.find(l => l.name === "Park"); if (!park || curLoc !== park.id) throw new Error("new place picked"); cxSet(run, { km: 5, sec: 1500 }); if (!/Park/.test(cxTxt(run, cxGet(run)))) throw new Error("place in summary");
    document.getElementById("run-modal").hidden = true; Object.assign(tg, kt); LOCS = LOCS.filter(l => l !== park); pickLoc("gym");
    openPlanAdd(); document.querySelector('#gen-body [data-pt="cardio"]').click(); if (document.querySelectorAll("#gen-body [data-padd]").length < 1 || [...document.querySelectorAll("#gen-body [data-padd]")].some(x => !isCardio(PROGS[x.dataset.padd]))) throw new Error("cardio tab");
    const n = Object.keys(PROGS).length; document.querySelector("#gen-body [data-pnew]").click(); closeGen(); if (Object.keys(PROGS).length !== n) throw new Error("closing create must not add a program"); paTab = "gym"; }],
  ["explicit-save", () => { TXS.length = 0; txBar(); location.hash = "gym"; const nm0 = PROGS.push.name, stored = () => JSON.parse(localStorage.getItem("progs") || "{}").push?.name;
    const edit = v => { pmOnly = "push"; pmFromList = false; renderPM(); document.getElementById("pm-modal").hidden = false; const i = document.querySelector('#pm-body [data-f="name"]'); i.value = v; i.dispatchEvent(new Event("change")); };
    edit("Draft X"); if (stored() === "Draft X") throw new Error("edit stored before Save"); const bar = document.getElementById("tx-bar"); if (bar.hidden || bar.querySelector("[data-tx-save]").disabled) throw new Error("save bar");
    bar.querySelector("[data-tx-cancel]").click(); document.querySelector("#tx-ask [data-drop]").click(); if (PROGS.push.name !== nm0 || !bar.hidden) throw new Error("cancel restores");
    edit("Saved Y"); bar.querySelector("[data-tx-save]").click(); if (stored() !== "Saved Y" || TXS.length) throw new Error("save stores");
    PROGS.push.name = nm0; saveProgs(); }],
  ["1rm", () => open1RM()], ["badges", () => openBadges()],
];
for (const [name, fn] of steps) { await p.evaluate(fn); await p.waitForTimeout(250); console.log("ok", name); }
await b.close(); srv.close();
if (errs.length) { console.error("FAIL", errs); process.exit(1); }
console.log("PASS");
})();
