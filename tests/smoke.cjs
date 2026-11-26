// Smoke test: serves public/ with a fake API (401), opens every tab and main modal on an
// iPhone-sized viewport, and fails on any page error. Run: npm test
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
(async () => {
if (process.argv.length === 2) {
  for (const suite of ["workout-blank-kg.cjs", "workout-weight-controls.cjs", "workout-replace.cjs", "pm-reorder.cjs", "home-quest.cjs", "eat-next.cjs"]) {
    execFileSync(process.execPath, [path.join(__dirname, suite)], { stdio: "inherit" });
  }
}
const root = path.resolve("public"), types = { js: "text/javascript", css: "text/css", png: "image/png", gif: "image/gif", json: "application/json" };
const srv = http.createServer((q, r) => {
  if (q.url.startsWith("/api")) { r.writeHead(401, { "content-type": "application/json" }); return r.end("{}"); }
  const f = path.join(root, q.url === "/" ? "index.html" : decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": types[f.split(".").pop()] || "text/html" }); r.end(d); });
});
await new Promise(resolve => srv.listen(0, "127.0.0.1", resolve));
const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 430, height: 932 } })).newPage(), errs = [];
p.on("pageerror", e => errs.push(e.message));
// pin the clock to a Thursday (badminton day in the default schedule) so date-based steps are stable
await p.addInitScript(() => { const T0 = new Date("2026-11-19T10:00:00").getTime(), real = Date.now(), R = Date;
  class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
  window.Date = D; localStorage.setItem("scheme", "4"); });
await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.waitForTimeout(800);
await p.evaluate(() => (document.getElementById("login").hidden = true));
const focused = process.argv.slice(2).filter(arg => ["--share-after-save", "--history-edit"].includes(arg));
if (!focused.length || focused.includes("--share-after-save")) await require("./share-after-save.cjs")(b, p.url());
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
  ["recovery-19", () => { location.hash = "stats"; if (document.querySelectorAll("#rec-card .rec-grid .rec-t").length !== 19) throw new Error("recovery should list 19 muscles"); }],
  ["muscle-sheet", () => { openMuscle("calf"); if (document.getElementById("gen-sheet").hidden || !document.getElementById("gen-body").textContent.includes("program")) throw new Error("muscle sheet"); document.getElementById("gen-sheet").hidden = true; }],
  ["no-inline-gif", () => { openSheet("push"); const n = document.querySelectorAll('#prog-sheet img[src$=".gif"]').length; document.getElementById("prog-sheet").hidden = true; openLib(); const m = document.querySelectorAll('#lib-list img[src$=".gif"]').length; document.getElementById("lib-modal").hidden = true; if (n || m) throw new Error("inline gif found"); }],
  ["howto", () => { openHowTo("chest-press", "Chest Press Machine"); document.getElementById("gen-sheet").hidden = true; }],
  ["review-ui", () => { location.hash = "more"; if (document.querySelectorAll("#v-more .grp-h").length !== 5) throw new Error("more groups");
    document.getElementById("loc-open").click(); if (!document.querySelector("#gen-body [data-pladd]")) throw new Error("places sheet"); closeGen();
    openHowTo("chest-press", "Chest Press Machine"); if (!document.querySelector("#gen-body .sh-x") || !document.querySelector("#gen-body .sticky-b")) throw new Error("how-to close"); closeGen();
    location.hash = "stats"; renderBody(); if (!document.querySelector("#body-card .card-h #bw-add.primary") || !document.querySelector("#body-card .segc")) throw new Error("body card"); }],
  ["more-language", () => {
    location.hash = "more";
    const entries = document.querySelectorAll('[data-act="lang"]');
    if (document.getElementById("lang") || entries.length !== 1 || !entries[0].closest("#v-more")) throw new Error("language has one entry in More");
    const initial = document.documentElement.lang;
    const check = (code, label) => {
      if (document.documentElement.lang !== code || localStorage.getItem("lang") !== code || document.getElementById("more-lang").textContent !== label) throw new Error("language should update and persist as " + code);
    };
    entries[0].click();
    check(initial === "en" ? "th" : "en", initial === "en" ? "ไทย" : "English");
    entries[0].click();
    check(initial, initial === "en" ? "English" : "ไทย");
  }],
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
    if (document.querySelectorAll("#today:not([hidden]) .primary, #progs .pc-go.primary").length !== 1) throw new Error("one primary action before choosing a program");
    const chip = document.querySelector('#lochead [data-cr="prog"]'); if (!chip) throw new Error("program chip"); chip.click();
    const k = weightsHere()[1]; document.querySelector(`#gen-body [data-pp="${k}"]`).click(); renderToday();
    if (!document.querySelector("#lochead").textContent.includes(PROGS[k].name) || !document.querySelector('#today [data-today="start:' + k + '"]')) throw new Error("chosen program on chip + today");
    const secondary = document.querySelectorAll("#progs .pc-go, #share-last");
    if (secondary.length < 3 || [...secondary].some(b => getComputedStyle(b).backgroundImage !== "none")) throw new Error("program alternatives and Share use secondary styles");
    logs.push(...saved); }],
  ["no-emoji", () => { ["food", "gym", "stats", "more"].forEach(h => { location.hash = h; }); deEmoji(document.body);
    const txt = document.body.innerText; const m = txt.match(/\p{Extended_Pictographic}/u); if (m && !/[✓✕✎☰↗★⚠▶]/.test(m[0])) throw new Error("emoji left: " + m[0]);
    if (getComputedStyle(document.getElementById("hero")).display !== "none") throw new Error("level character should be hidden"); }],
  ["day-queue", () => { location.hash = "gym"; const saved = logs.filter(l => l.date === TODAY); logs = logs.filter(l => l.date !== TODAY); cancelProg(); setDayMode(null); dayPlan = {}; renderGym();
    openPlanAdd(); document.querySelector('#gen-body [data-padd="pull"]').click(); document.querySelector('#gen-body [data-padd="push2"]').click(); document.querySelector("#gen-body [data-pgo]").click();
    if (!document.querySelector('#locpick [data-pl="push2"]')) throw new Error("multi-select adds both"); const row = document.querySelector('#locpick [data-pl="pull"]'); if (!row || !row.classList.contains("st-pend")) throw new Error("added row pending");
    (row.querySelector('[data-plgo="start"]') || (row.click(), document.querySelector('#gen-body [data-pis]'))).click(); if (!picked || cur !== "pull") throw new Error("start from list (Start, or row → sheet → Start)");
    if (document.querySelectorAll('#locpick [data-plgo="start"].primary').length > 1) throw new Error("only one primary Start in the plan list");
    setDayMode(null); renderGym(); if (!document.querySelector('#locpick [data-pl="pull"].st-prog')) throw new Error("in progress row");
    cancelProg(); setDayMode(null); renderGym(); if (document.querySelector('#locpick [data-pldel]')) throw new Error("no one-tap remove on rows"); openPlanItem("pull"); document.querySelector('#gen-body [data-pid]').click(); if (document.querySelector('#locpick [data-pl="pull"]')) throw new Error("remove row via its sheet");
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
  ["hit-areas", () => { document.getElementById("toast").hidden = true;   /* a level-up toast from an earlier step is transient, not a layout bug */ document.querySelectorAll(".modal,#gen-sheet,#prog-sheet,#undo-bar").forEach(m => m.hidden = true); location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); scrollAppTop();
    const bad = [...document.querySelectorAll("#v-gym button,#v-gym [role=button]")].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || r.top < 0 || r.bottom > innerHeight - 100) return false;
      const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && h !== e && !e.contains(h) && !h.closest(".wo-top"); });
    if (bad.length) throw new Error("covered buttons: " + bad.map(e => { const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e.className + "|" + e.textContent.trim().slice(0, 15) + " by " + (h && (h.id || h.className)) }).join(", ")); }],
  ["figure-layers", () => { setDayMode(null); renderGym(); openMuscle("delt"); const bad = [...document.querySelectorAll(".body-fig")].filter(f => new Set([...f.children].map(c => { const r = c.getBoundingClientRect(); return [r.width, r.height, r.left, r.top].map(Math.round).join() })).size > 1);
    closeGen(); if (bad.length) throw new Error(bad.length + " muscle figures have misaligned colour layers"); }],
  ["rec-palette", () => { location.hash = "more"; document.getElementById("pal-open").click(); const r = document.querySelector('#gen-body [data-pal="app"]'); if (!r) throw new Error("palette sheet"); r.click();
    if (REC_C[3] !== "#f97316") throw new Error("palette applied"); document.querySelector('#gen-body [data-pal="heat"]').click(); closeGen(); }],
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
  ["meal-plan-edit", () => { TXS.length = 0; txBar(); const p0 = P_TARGET, n0 = MEALS.length; openMealPlan(); const g = document.querySelector('#gen-body [data-g="p"]'); g.value = "175"; g.dispatchEvent(new Event("change"));
    document.querySelector("#gen-body [data-addm]").click(); if (MEALS.length !== n0 + 1) throw new Error("add meal"); document.querySelector("#tx-bar [data-tx-cancel]").click(); document.querySelector("#tx-ask [data-drop]").click();
    if (P_TARGET !== p0 || MEALS.length !== n0) throw new Error("cancel restores meal plan"); openMealPlan(); const g2 = document.querySelector('#gen-body [data-g="p"]'); g2.value = "175"; g2.dispatchEvent(new Event("change"));
    document.querySelector("#tx-bar [data-tx-save]").click(); if (JSON.parse(localStorage.getItem("mealplan")).p !== 175 || P_TARGET !== 175) throw new Error("save meal plan"); MP = null; localStorage.removeItem("mealplan"); mpApply(); }],
  ["plan-place-fixed", () => { location.hash = "gym"; cancelProg(); setDayMode(null); dayPlan = {}; planAdd("push"); renderGym();
    const r = document.querySelector('#locpick [data-pl="push"]'); if (!r || r.querySelector("[data-plloc]") || !r.querySelector(".loc-tag")) throw new Error("place in today's plan is a fixed label");
    dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["home-3-questions", () => { location.hash = "home"; show("home"); const c = document.querySelectorAll("#v-home .hq-card"); if (c.length !== 3) throw new Error("three question cards");
    if (document.querySelectorAll(".tabbar .tab").length !== 6) throw new Error("six tabs"); show("body"); if (document.getElementById("v-stats").hidden || stTab !== "body") throw new Error("body tab"); show("gym"); }],
  ["undo-setup", () => { location.hash = "gym"; dayPlan = {}; save("dayplan", dayPlan); userAt = Date.now(); planAdd("pull"); }],
  ["undo-run", () => { const b = document.getElementById("undo-bar"); if (!b || b.hidden) throw new Error("undo bar after save"); b.querySelector("[data-undo]").click(); if (planList().includes("pull") && !planKeys(DAY).includes("pull")) throw new Error("undo restores today plan");
    userAt = 0; const n = logs.length; logs.push({ date: DAY, prog: "pull", ex: { x: [{ kg: 1, reps: 1 }] } }); save("gymlog", logs); setDayMode(null); planAdd("pull"); renderGym(); const r = document.querySelector('#locpick [data-pl="pull"]'); if (!r) throw new Error("done row"); r.click();
    const d = document.querySelector('#gen-body [data-dm="del"]'); if (!d) throw new Error("done sheet"); d.click(); if (logs.length !== n) throw new Error("remove saved workout"); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["back-flow", () => { location.hash = "gym"; cancelProg(); dayPlan = {}; planAdd("push"); planAdd("pull"); setDayMode(null); renderGym(); startPlanItem("push", true);
    if (!document.body.classList.contains("wo-focus")) throw new Error("focus mode"); draft.ex = draft.ex || {}; const id = PROGS.push.ex[0].id; draft.ex[id] = [{ kg: "40", reps: "5", ok: true }]; save("gymdraft", draft);
    document.getElementById("wo-back").click(); if (document.body.classList.contains("wo-focus") || !picked) throw new Error("back keeps session"); startPlanItem("pull", true);
    if (!document.querySelector('#gen-body [data-sw="keep"]')) throw new Error("switch ask"); document.querySelector('#gen-body [data-sw="keep"]').click(); if (cur !== "push" || !picked) throw new Error("keep session");
    cancelProg(); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["scroll-keep-1", () => { location.hash = "gym"; cancelProg(); setDayMode(null); dayPlan = {}; planAdd("push"); renderGym(); appScroll().scrollTop = 500; window._y = appScroll().scrollTop; openPlanItem("push"); }],
  ["scroll-keep-2", () => { appScroll().scrollTop = 0; document.querySelector("#gen-body .sh-x").click(); }],
  ["scroll-keep-3", () => { if (Math.abs(appScroll().scrollTop - window._y) > 5) throw new Error("scroll restored after closing a sheet: " + appScroll().scrollTop + "/" + window._y); renderGym(); if (Math.abs(appScroll().scrollTop - window._y) > 5) throw new Error("scroll kept across re-render"); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["eat-calendar", () => { location.hash = "food"; show("food"); renderFood(); const d = document.querySelectorAll("#eat-cal .hq-day"); if (d.length !== 7) throw new Error("eat week"); if (!document.querySelector("#v-stats #food-hist") || document.querySelector("#v-food #food-hist")) throw new Error("nutrition lives in Stats");
    if (!document.getElementById("step1").hidden) throw new Error("workout calendar not on Eat"); show("gym"); if (document.getElementById("step1").hidden) throw new Error("workout calendar on Train"); }],
  ["quick-create", () => { location.hash = "gym"; paTab = "gym"; openPlanAdd(); const nl = LOCS.length, np = Object.keys(PROGS).length; document.querySelector('#gen-body [data-pcnew]').click(); document.getElementById("qp-name").value = "Home2"; document.querySelector("#gen-body [data-qs]").click();
    const l = LOCS.find(x => x.name === "Home2"); if (!l || LOCS.length !== nl + 1 || paLoc !== l.id || Object.keys(PROGS).length !== np) throw new Error("new place only");
    document.querySelector('#gen-body [data-pnew]').click(); document.getElementById("qg-name").value = "Quick A"; document.querySelector("#gen-body [data-qa]").click(); if (getComputedStyle(document.getElementById("lib-modal")).zIndex <= getComputedStyle(document.getElementById("gen-sheet")).zIndex) throw new Error("library above the form"); libMode.onPick(EXLIB[0]); document.querySelector("#gen-body [data-qs]").click();
    const k = Object.keys(PROGS).find(q => PROGS[q].name === "Quick A"); if (!k || PROGS[k].loc !== l.id || PROGS[k].ex.length !== 1 || !document.querySelector(`#gen-body [data-padd="${k}"].sel`)) throw new Error("new program under place, picked");
    closeGen(); delete PROGS[k]; LOCS = LOCS.filter(x => x !== l); paLoc = null; }],
  ["back-one-level", () => { location.hash = "gym"; cancelProg(); setDayMode(null); dayPlan = {}; planAdd("push"); renderGym(); closeGen();
    const x = () => document.querySelector("#gen-body .sh-x").click(), title = () => document.getElementById("gen-sheet").hidden ? "(closed)" : document.querySelector("#gen-body .sheet-h b").textContent, want = (v, w) => { if (v !== w) throw new Error("back went to " + v + " instead of " + w) };
    openPlanItem("push"); const it = title(); if (document.querySelector("#gen-body [data-pil]")) throw new Error("program sheet must not edit place"); if (document.querySelectorAll("#gen-body [data-pihow]").length !== PROGS.push.ex.length) throw new Error("every exercise numbered with how-to"); openPlanPlace("push"); const pl = title(); document.querySelector("#gen-body [data-ppman]").click(); const mp = title();
    document.querySelector("#gen-body [data-pl]").click(); x(); want(title(), mp); x(); want(title(), pl); x(); want(title(), it); x(); want(title(), "(closed)");
    openPlanAdd(); const ad = title(); document.querySelector("#gen-body [data-pcnew]").click(); document.querySelector("#gen-body [data-qb]").click(); want(title(), ad);
    document.querySelector("#gen-body [data-pnew]").click(); document.querySelector("#gen-body [data-qb]").click(); want(title(), ad); x(); want(title(), "(closed)");
    openPlanItem("push"); document.querySelector("#gen-body [data-pie]").click(); document.getElementById("pm-close").click(); }],
  ["back-one-level-2", () => { const t2 = document.getElementById("gen-sheet").hidden ? "" : document.querySelector("#gen-body .sheet-h b").textContent; if (t2 !== PROGS.push.name) throw new Error("closing the program editor should return to its sheet, got: " + t2); closeGen(); dayPlan = {}; setDayMode("train"); pickLoc("gym"); }],
  ["delete-from-add", () => { location.hash = "gym"; closeGen(); PROGS["ztest"] = { name: "ZTest", sub: "", ex: [], loc: "gym", days: [] }; paTab = "gym"; paLoc = "gym"; openPlanAdd(); document.querySelector("#gen-body [data-pedit]").click();
    const r = () => document.querySelector('#gen-body [data-pdel="ztest"]'); r().click(); if (!PROGS.ztest) throw new Error("first tap only asks"); r().click(); if (PROGS.ztest) throw new Error("deleted on second tap"); closeGen(); }],
  ["recovery-config", () => { const before = recH("chest"); openRecCfg(); document.querySelector('#gen-body [data-rh="chest"][data-d="12"]').click(); document.querySelector("#gen-body [data-rsave]").click();
    if (recH("chest") !== before + 12 || JSON.parse(localStorage.getItem("rech")).chest !== before + 12) throw new Error("save per-muscle hours"); REC_USER = {}; save("rech", REC_USER); }],
  ["share-roundtrip", async () => { const d = shareData(["push"], "gym"); const s = await packShare(d); const o = await unpackShare(s); if (o.progs[0].ex.length !== PROGS.push.ex.length) throw new Error("roundtrip");
    let bad = false; try { await unpackShare("j.!!!") } catch (e) { bad = true } if (!bad) throw new Error("bad link rejected");
    const nl = LOCS.length, np = Object.keys(PROGS).length; const n = doImport(o, [0], "new"); if (n !== 1 || LOCS.length !== nl + 1 || Object.keys(PROGS).length !== np + 1) throw new Error("import");
    const nk = Object.keys(PROGS).find(k => locOf(PROGS[k]) === LOCS[LOCS.length - 1].id); if (PROGS[nk].ex.length !== PROGS.push.ex.length) throw new Error("import exercises");
    delete PROGS[nk]; LOCS.pop(); curLoc = "gym"; }],
  ["share-sheet", () => { openShareLink(["push"], "gym"); }],
  ["share-sheet-2", () => { if (!document.querySelector("#gen-body .sh-url") || !/#import=/.test(document.querySelector("#gen-body .sh-url").textContent)) throw new Error("share link shown"); closeGen(); }],
  ["onboarding-build", () => { const tg = calcTargets({ sex: "m", age: 30, h: 175, w: 72, goal: "bulk", act: "mid" }); if (tg.k < 2400 || tg.k > 3100 || tg.p !== Math.round(72 * 1.8)) throw new Error("targets " + JSON.stringify(tg));
    const ms = buildMeals(4, tg.k, tg.p); if (ms.length !== 4 || Math.abs(ms.reduce((a, m) => a + m.k, 0) - tg.k) > 40) throw new Error("meals add up");
    const b = buildPlan({ places: ["gym", "home", "cardio"], days: 4, plan: "tpl" }); const ws = Object.values(b.progs).filter(p => p.ex && p.ex.length);
    if (b.locs.length !== 3 || ws.length !== 8) throw new Error("4 programs × 2 places, got " + ws.length); if (ws.filter(p => p.days.length).length !== 4) throw new Error("only the first place is scheduled");
    if (!Object.values(b.progs).some(p => p.tag === "run")) throw new Error("cardio"); const home = b.locs[1].id; if (ws.filter(p => p.loc === home).some(p => p.ex.some(e => e.z === "🔩"))) throw new Error("no machines at home"); }],
  ["onboarding-ui", () => { openOnboarding(); const m = document.getElementById("onb"); if (m.hidden || !m.querySelector("[data-p='age']")) throw new Error("step 1"); for (let i = 0; i < 3; i++) m.querySelector('[data-onb="next"]').click(); if (!m.querySelector("[data-plan]")) throw new Error("step 4"); m.hidden = true; }],
  ["meal-plans", () => { openMealPlan(); const b = document.getElementById("gen-body"), nm = b.querySelector("[data-mpname]"); nm.value = "Bulk"; nm.dispatchEvent(new Event("change"));
    if (MP.saved.map(x => x.name).join() !== "Bulk") throw new Error("rename kept");
    b.querySelector("[data-mpdup]").click(); const nm2 = document.querySelector("#gen-body [data-mpname]"); nm2.value = "Cut"; nm2.dispatchEvent(new Event("change"));
    if (MP.saved.map(x => x.name).join() !== "Bulk,Cut" || new Set(MP.saved.map(x => x.id)).size !== 2) throw new Error("duplicate is its own plan: " + MP.saved.map(x => x.name));
    document.querySelector("#gen-body [data-mpuse]").click(); if (MP.name !== "Bulk") throw new Error("switch");
    txCancel(); closeGen(); }],
  ["explore-ui", () => { location.hash = "explore"; show("explore"); if (document.querySelectorAll("#v-explore [data-xt]").length !== 6) throw new Error("explore tabs");
    publishMeals(); if (!document.querySelector("#gen-body #pub-t") || document.querySelectorAll("#gen-body [data-tag]").length < 10) throw new Error("share sheet"); closeGen(); location.hash = "gym"; }],
  ["cardio-close-stays", () => { location.hash = "gym"; setDayMode(null); renderGym(); const k = Object.keys(PROGS).find(q => PROGS[q].track === "dist");
    startPlanItem(k, true); if (document.getElementById("run-modal").hidden) throw new Error("cardio start should open the log");
    document.getElementById("run-close").click(); if (document.getElementById("locpick").hidden) throw new Error("closing the cardio log must leave the plan screen up"); }],
  ["home-recovery-stays", () => { location.hash = ""; renderHome(); renderHome(); const w = document.getElementById("rec-wrap");
    if (!w || !document.getElementById("v-home").contains(w) || w.hidden) throw new Error("muscle recovery must survive a re-render of Today"); }],
  ["home-rec-cfg-button", () => { location.hash = ""; recOpen = true; renderHome(); document.getElementById("rec-cfg").click();
    if (document.getElementById("gen-sheet").hidden) throw new Error("Recovery times button must open its sheet"); closeGen(); }],
  ["home-body-log-button", () => { location.hash = ""; recOpen = true; BODY = BODY.filter(x => x.d !== TODAY).concat([{ d: TODAY, kg: 70 }]); renderHome();
    const b = document.querySelector("[data-weigh]"); if (!b) throw new Error("body log button must stay after logging today"); b.click();
    if (document.getElementById("gen-sheet").hidden) throw new Error("body log button must open the sheet"); closeGen(); }],
  ["home-done-states", () => { location.hash = ""; const keep = JSON.stringify(dayPlan); dayPlan = {}; const k = Object.keys(PROGS).find(q => !isCardio(PROGS[q])); planAdd(k); planList().filter(q => q !== k).forEach(q => { try { planDel && planDel(q) } catch (e) {} }); logs.push({ date: TODAY, at: Date.now(), prog: k, ex: {} });
    food[TODAY] = food[TODAY] || { done: {} }; food[TODAY].done = food[TODAY].done || {}; mealList().forEach(m => food[TODAY].done[m.id] = true); renderHome();
    const tx = document.getElementById("v-home").innerText; if (/Start|เริ่ม/.test(document.querySelector(".hq-main").innerText) && !/✓/.test(tx)) throw new Error("finished workout must show a done state: "+JSON.stringify({DAY,TODAY,k,cardio:isCardio(PROGS[k]),ks:planList(),txt:document.querySelector(".hq-main").innerText}));
    const go = document.querySelector(".hq-main .hq-go"); if (go && go.dataset.start && !isCardio(PROGS[go.dataset.start])) throw new Error("no Start button once today is done");
    if (!document.querySelectorAll(".hq-mc.on").length || document.querySelector(".hq-mc:not(.on)")) throw new Error("all meal chips ticked");
    logs.pop(); food[TODAY].done = {}; dayPlan = JSON.parse(keep); renderHome(); }],
  ["home-swap-counts-as-done", () => { location.hash = ""; const keep = JSON.stringify(dayPlan); dayPlan = {}; const ws = Object.keys(PROGS).filter(q => !isCardio(PROGS[q]));
    const k = ws[0]; planAdd(k); const pl = planList(), other = ws.find(q => !pl.some(z => PROGS[z].name === PROGS[q].name)); pl.forEach(q => { if (q !== k) logs.push({ date: TODAY, at: Date.now(), prog: q, ex: {} }) });
    logs.push({ date: TODAY, at: Date.now(), prog: other, ex: {} }); renderHome();
    const go = document.querySelector(".hq-main .hq-go"); if (go && go.dataset.start && !isCardio(PROGS[go.dataset.start])) throw new Error("swap-done: "+JSON.stringify({ks:planList(),k,other,txt:document.querySelector(".hq-main").innerText,DAY,TODAY}));
    logs = logs.filter(l => !(l.date === TODAY && !Object.keys(l.ex).length)); dayPlan = JSON.parse(keep); renderHome(); }],
  ["home-all-meal-chips", () => { location.hash = ""; mealsOpen = false; renderHome(); if (!document.querySelector("#v-home [data-moremeals]") && mealList().length > 1) throw new Error("folded meals need a +N chip"); document.querySelector("#v-home [data-moremeals]")?.click(); const n = document.querySelectorAll("#v-home [data-meal]").length; mealsOpen = false;
    if (n !== mealList().length) throw new Error("Today must show a chip for every meal in the plan: " + n + " vs " + mealList().length); }],
  ["home-details-toggle", () => { location.hash = ""; renderHome(); const r = () => document.getElementById("hq-rec"), was = r().hidden;
    document.querySelector("[data-det]").click(); if (r().hidden === was) throw new Error("Details must show/hide the muscle map");
    document.querySelector("[data-det]").click(); if (r().hidden !== was) throw new Error("Details must toggle back"); }],
  ["home-lists-every-plan-item", () => { location.hash = ""; renderHome(); const n = planList().length;
    if (n > 1 && document.querySelectorAll(".hq-plist .hq-pi").length !== n) throw new Error("Today must list every plan item: " + n); }],
  ["home-one-row-per-plan-item", () => { location.hash = ""; renderHome(); if (document.querySelector("#v-home [data-pick]")) throw new Error("no place picker — one row per plan item like Train");
    const n = planList().length; if (n > 1 && document.querySelectorAll(".hq-plist .hq-pi").length !== n) throw new Error("Today must show one row per plan item: " + n); }],
  ["home-empty-plan-and-rest", () => { location.hash = ""; const keep = JSON.stringify(dayPlan); planList().forEach(q => planDel(q)); renderHome();
    if (!document.querySelector("#v-home .hq-card")) throw new Error("Today must render with an empty plan");
    setDayMode("rest"); renderHome(); if (!document.querySelector("#v-home .hq-card")) throw new Error("Today must render on a rest day");
    setDayMode(null); dayPlan = JSON.parse(keep); renderHome(); }],
  ["home-swap-single-place", () => { location.hash = ""; renderHome(); const go = document.querySelector(".hq-main .hq-go[data-start]"); if (!go) return;
    const k = go.dataset.start; if (planList().includes(k)) return; if (document.querySelectorAll(".hq-main .hq-pv~.hq-locs [data-pick], .hq-main .hq-locs [data-pick]").length && !planList().some(q => PROGS[q].name === PROGS[k].name))
      throw new Error("a suggested program must show only its own place"); }],
  ["home-lead-row-first", () => { location.hash = ""; renderHome(); const rows = document.querySelectorAll(".hq-plist .hq-pi"); if (rows.length < 2) return;
    if (!rows[0].querySelector(".hq-ps.primary")) throw new Error("the suggested item (primary Start) must be the first row"); }],
  ["home-calendar-links-tabs", () => { location.hash = ""; show("home"); const c = document.querySelectorAll("#home-cal [data-cd]:not([disabled])"); if (c.length < 2) throw new Error("Today needs the week calendar");
    const keep = DAY, d = [...c].find(b => b.dataset.cd !== DAY); d.click(); if (DAY !== d.dataset.cd) throw new Error("picking a day on Today must move DAY");
    DAY = keep; renderAll(); }],
  ["workout-set-buttons-keep-card", () => { location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); const k = planList().find(q => !isCardio(PROGS[q])); startPlanItem(k, true);
    const vis = () => document.querySelector("#exs .ex.pg-on"); if (!vis()) return; const n0 = vis().querySelectorAll(".sets input[type=checkbox]").length;
    vis().querySelector("[data-add]").click(); if (!vis()) throw new Error("+Set must keep the exercise on screen"); if (vis().querySelectorAll(".sets input[type=checkbox]").length !== n0 + 1) throw new Error("+Set adds a row");
    vis().querySelector("[data-del]").click(); if (!vis() || vis().querySelectorAll(".sets input[type=checkbox]").length !== n0) throw new Error("−Set removes a row and keeps the card");
    vis().querySelector("[data-all]").click(); if (!vis()) throw new Error("Tick all keeps the card"); cancelProg(); }],
  ["workout-rest-then-cancel", () => { location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); const k = planList().find(q => !isCardio(PROGS[q])); startPlanItem(k, true);
    const c = document.querySelector("#exs .ex.pg-on"); if (!c) return; const e = sessEx()[woIdx]; startRest(e, 0, draft.ex[e.id] || []);
    const bar = document.getElementById("step4"); if (getComputedStyle(bar).display !== "none") throw new Error("Cancel/Finish are hidden while the rest timer is up");
    document.getElementById("rest-skip").click(); if (!document.getElementById("rest").hidden) throw new Error("Ready closes the rest timer"); if (getComputedStyle(bar).display === "none") throw new Error("Cancel/Finish come back after Ready");
    document.getElementById("cancel-w").click(); if (picked) throw new Error("cancel returns to the plan"); }],
  ["workout-edit-one-bar", () => { location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym(); const k = planList().find(q => !isCardio(PROGS[q])); startPlanItem(k, true);
    const c = () => document.querySelector("#exs .ex.pg-on"); if (!c()) return; c().querySelector("[data-all]").click(); goEx(1); goEx(0); c().querySelector("[data-edit]").click();
    const d = c().querySelector("[data-done]"); if (!d || !d.textContent.trim()) throw new Error("edit card Done button needs a label");
    const tx = document.getElementById("tx-bar"); if (tx && !tx.hidden && getComputedStyle(document.getElementById("step4")).display !== "none") throw new Error("only one bottom bar while editing");
    d.click(); if (getComputedStyle(document.getElementById("step4")).display === "none") throw new Error("workout bar returns after Done"); cancelProg(); }],
  ["1rm", () => open1RM()], ["badges", () => openBadges()],
];
if (!focused.length || focused.includes("--history-edit")) {
  await require("./history-edit.cjs")(b, p.url());
  console.log("ok history-edit");
}
if (!focused.length) {
  for (const [name, fn] of steps) { await p.evaluate(fn); await p.waitForTimeout(250); console.log("ok", name); }
}
await b.close(); srv.close();
if (errs.length) { console.error("FAIL", errs); process.exit(1); }
console.log("PASS");
})();
