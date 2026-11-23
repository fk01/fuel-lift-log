// Regression test: a set ticked with an empty kg box must not be silently dropped on save.
// Bug: public/js/workout.js ~L39 (ok "change" handler) lets a blank-kg set be ticked when no row
// and no last session has kg > 0; ~L92 (commitDraft) then filters `r.kg !== ""` and the set vanishes
// without any toast (doSave's noKg toast only fires when the whole commit fails).
// Expected: a blank-kg tick is refused (checkbox unticked, toast "ใส่น้ำหนักก่อนติ๊ก", keypad opens on
// that kg box), so no ticked set can disappear on save. Valid ticks must still work.
// Every case runs in its own browser context (fresh localStorage, no shared draft/logs).
// Values are entered through the keypad and the workout is finished through the Finish button + its
// confirmation, so the test exercises the same path a user does.
// Run: node tests/workout-blank-kg.cjs   (not wired into npm test; package.json is out of scope)
const { chromium } = require("playwright");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");

const root = path.resolve("public"), types = { js: "text/javascript", css: "text/css", png: "image/png", gif: "image/gif", json: "application/json" };
function startServer() {
  const srv = http.createServer((q, r) => {
    if (q.url.startsWith("/api")) { r.writeHead(401, { "content-type": "application/json" }); return r.end("{}"); }
    const f = path.join(root, q.url === "/" ? "index.html" : decodeURIComponent(q.url.split("?")[0]));
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": types[f.split(".").pop()] || "text/html" }); r.end(d); });
  });
  return new Promise((res, rej) => { srv.once("error", rej); srv.listen(0, "127.0.0.1", () => res(srv)); });   // ephemeral port
}

// fresh context + page, app booted, a strength workout started at the gym with no history anywhere
async function freshWorkout(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const p = await ctx.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => { const T0 = new Date("2026-11-19T10:00:00").getTime(), real = Date.now(), R = Date;
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
    window.Date = D; localStorage.setItem("scheme", "4"); });
  await p.goto(base);
  // explicit readiness: every global the test drives must exist, plus the login overlay and Finish button
  // (top-level const/let such as t, logs, draft are not on window, so check them by name)
  await p.waitForFunction(() => typeof startPlanItem === "function" && typeof renderGym === "function" && typeof finishWorkout === "function"
    && typeof openPad === "function" && typeof toast === "function" && typeof t === "function" && Array.isArray(logs)
    && !!document.getElementById("login") && !!document.getElementById("save-w"), null, { timeout: 15000 });
  await p.evaluate(() => (document.getElementById("login").hidden = true));
  const setup = await p.evaluate(() => {
    location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); renderGym();
    const k = weightsHere().find(q => !isCardio(PROGS[q])); if (!k) return { err: "no strength program at gym" };
    startPlanItem(k, true);
    const ex = sessEx(); if (ex.length < 2) return { err: "need 2 exercises, got " + ex.length };
    if (logs.length) return { err: "expected empty logs" };
    return { prog: cur, day: DAY, A: ex[0].id, B: ex[1].id, Bs: ex[1].s };
  });
  if (setup.err) throw new Error("SETUP: " + setup.err);
  await p.waitForSelector(`#ok-${setup.A}-0`, { state: "attached" }); await p.waitForSelector(`#ok-${setup.B}-0`, { state: "attached" });
  p.setDefaultTimeout(5000);
  return { ctx, p, errs, ...setup };
}

// the workout shows one exercise card at a time with a "next exercise" card under it (the ‹ › pager is hidden in
// this layout); tap that next card until the card holding `id` is shown. Cases only move forward (A, then B).
async function show(p, id) {
  for (let n = 0; n < 12; n++) {
    if (await p.locator(`#${id}`).isVisible()) return;
    const want = id.match(/^(?:kg|rp|ok)-(.+)-\d+$/)[1];
    if (await p.evaluate(w => sessEx().map(e => e.id).indexOf(w) < woIdx, want))
      throw new Error(`card for ${id} is behind the shown card; the visible UI only moves forward`);
    await p.click("#exs .ls-next");
  }
  throw new Error(`card for ${id} never became visible`);
}
// a valid tick starts the rest timer, which covers the card; end it with its "Next" card (#rest-up) like a user would
async function closeRest(p) {
  await p.waitForTimeout(500);   // rest timer may auto-advance to the next card after 400 ms
  if (await p.locator("#rest").isVisible()) { await p.click("#rest-up"); await p.waitForSelector("#rest", { state: "hidden" }); }
}
async function tickBox(p, id) { await show(p, id); await p.click(`#${id}`); await closeRest(p); }
// card menu ⋯ → "Tick all sets" (the visible way to reach the card's ✓✓ action)
async function tickAll(p, ex) {
  await show(p, `ok-${ex}-0`);
  await p.click(`.ex:has(#ok-${ex}-0) .mk-more`);
  await p.click('#gen-sheet:not([hidden]) [data-mk="all"]');
  await closeRest(p);
}
// keypad: kg via +10 steps then Done; reps via chip (chip tap closes the pad)
async function padKg(p, id, kg) {
  await show(p, id); await p.click(`#${id}`); await p.waitForSelector("#pad:not([hidden])");
  for (let left = kg; left > 0; left -= 10) await p.click(`#pad-steps button[data-d="10"]`);
  await p.click("#pad-done"); await p.waitForSelector("#pad", { state: "hidden" });
}
async function padReps(p, id, n) {
  await show(p, id);
  await p.click(`#${id}`); await p.waitForSelector("#pad:not([hidden])");
  await p.click(`#pad-chips button[data-v="${n}"]`); await p.waitForSelector("#pad", { state: "hidden" });
}
async function padClear(p, id) {
  await show(p, id);
  await p.click(`#${id}`); await p.waitForSelector("#pad:not([hidden])");
  await p.click("#pad-clear"); await p.waitForSelector("#pad", { state: "hidden" });
}
// visible state of one row, plus the draft row behind it
const rowState = (p, ex, i) => p.evaluate(([ex, i]) => {
  const kg = document.getElementById(`kg-${ex}-${i}`), rp = document.getElementById(`rp-${ex}-${i}`), cb = document.getElementById(`ok-${ex}-${i}`);
  const r = (draft.ex && draft.ex[ex] || [])[i] || {};
  return { kg: kg && kg.value, reps: rp && rp.value, checked: !!(cb && cb.checked), dkg: r.kg, dreps: r.reps, dok: r.ok };
}, [ex, i]);
// every checked box on screen, with the kg/reps shown next to it
const checkedOnScreen = p => p.evaluate(() => [...document.querySelectorAll('#exs input[type=checkbox][id^="ok-"]:checked')].map(cb => {
  const m = cb.id.match(/^ok-(.+)-(\d+)$/), ex = m[1], i = m[2];
  return { ex, kg: document.getElementById(`kg-${ex}-${i}`).value, reps: document.getElementById(`rp-${ex}-${i}`).value };
}));
// no row may be ticked while its kg box is blank
const blankTicked = p => checkedOnScreen(p).then(l => l.filter(s => s.kg === ""));

// Finish through the UI: Finish button, then whichever confirmation appears
// Every case leaves sets unticked, so Finish must ask first. Returns an error string, or null when it confirmed.
async function finishViaUi(w) {
  const p = w.p;
  await p.click(".wt-fin");   // Finish ✓ in the workout top bar (same handler as #save-w)
  const fin = p.locator("#gen-sheet:not([hidden]) #fin-ok"), cf = p.locator('#cf-sheet:not([hidden]) [data-cf="1"]');
  await Promise.race([fin.waitFor({ timeout: 3000 }), cf.waitFor({ timeout: 3000 })]).catch(() => {});
  const btn = (await fin.isVisible()) ? fin : (await cf.isVisible()) ? cf : null;
  if (!btn) return "Finish showed no confirmation";
  const early = await persisted(p, w.day, w.prog);
  if (early) return `log written before confirming: ${JSON.stringify(early)}`;
  await btn.click();
  await p.waitForTimeout(300);
  return null;
}
// what is stored for this workout, by exercise id
const persisted = (p, day, prog) => p.evaluate(([day, prog]) => {
  let L = []; try { L = JSON.parse(localStorage.getItem("gymlog") || "[]") } catch (e) {}
  const l = L.find(x => x.date === day && x.prog === prog);
  return l ? l.ex : null;
}, [day, prog]);
// compare what was ticked at Finish time with what got stored; a save with nothing in it is a failure
function compareSaved(ticked, saved) {
  const want = {}; ticked.forEach(s => (want[s.ex] = want[s.ex] || []).push({ kg: s.kg === "" ? "" : +s.kg, reps: +s.reps }));
  const nT = ticked.length, nS = saved ? Object.values(saved).reduce((n, s) => n + s.length, 0) : 0;
  if (!nT || !nS) return `nothing saved (ticked ${nT}, saved ${nS})`;
  const norm = o => JSON.stringify(Object.keys(o).sort().map(k => [k, o[k].map(s => [s.kg === "" ? "" : +s.kg, +s.reps])]));
  return norm(want) === norm(saved) ? null : `ticked ${nT} set(s), saved ${nS}: ticked=${JSON.stringify(want)} saved=${JSON.stringify(saved)}`;
}

const cases = [
  // 1: A starts blank + unchecked; ticking it is refused with toast and keypad on A's kg box
  ["tick blank kg is refused (toast + keypad)", async w => {
    const s0 = await rowState(w.p, w.A, 0);
    if (s0.kg !== "" || s0.checked || s0.dok) return `set A not blank/unchecked at start: ${JSON.stringify(s0)}`;
    await tickBox(w.p, `ok-${w.A}-0`);
    const s1 = await rowState(w.p, w.A, 0);
    const ui = await w.p.evaluate(A => ({
      toast: document.getElementById("toast").hidden ? null : document.getElementById("toast").textContent,
      want: t("ใส่น้ำหนักก่อนติ๊ก"),
      padOpen: !document.getElementById("pad").hidden,
      padTarget: pad && pad.el ? pad.el.id : null, wantTarget: `kg-${A}-0`,
    }), w.A);
    const bad = [];
    if (s1.checked || s1.dok) bad.push(`ticked with blank kg (checked=${s1.checked}, row.ok=${s1.dok}, kg="${s1.dkg}") — set will be dropped on save`);
    if (ui.toast !== ui.want) bad.push(`toast ${JSON.stringify(ui.toast)} ≠ ${JSON.stringify(ui.want)}`);
    if (!ui.padOpen || ui.padTarget !== ui.wantTarget) bad.push(`keypad open=${ui.padOpen} target=${ui.padTarget} (want ${ui.wantTarget})`);
    return bad.length ? bad.join("; ") : null;
  }],
  // 2: valid B tick works; blank A tick alongside it; Finish via UI keeps every ticked set
  ["save keeps every ticked set", async w => {
    await tickBox(w.p, `ok-${w.A}-0`);
    if (await w.p.isVisible("#pad")) { await w.p.click("#pad-done"); await w.p.waitForSelector("#pad", { state: "hidden" }); }
    await padKg(w.p, `kg-${w.B}-0`, 20); await padReps(w.p, `rp-${w.B}-0`, 10);
    await tickBox(w.p, `ok-${w.B}-0`);
    const b = await rowState(w.p, w.B, 0);
    if (!b.checked || b.kg !== "20" || b.reps !== "10" || !b.dok) return `set B not visibly ticked as 20×10: ${JSON.stringify(b)}`;
    const ticked = await checkedOnScreen(w.p);
    if (!ticked.some(s => s.ex === w.B && s.kg === "20" && s.reps === "10")) return `set B lost its tick before Finish: ${JSON.stringify(ticked)}`;
    const fe = await finishViaUi(w); if (fe) return fe;
    return compareSaved(ticked, await persisted(w.p, w.day, w.prog));
  }],
  // 3: "Tick all" (workout.js ~L47-48): ticks a filled exercise fully, never ticks blank-kg rows
  ["tick all never ticks blank kg", async w => {
    await tickAll(w.p, w.A);
    const blank = await blankTicked(w.p);
    if (blank.length) return `tick all ticked ${blank.length} blank-kg set(s): ${JSON.stringify(blank)}`;
    for (let i = 0; i < w.Bs; i++) await padKg(w.p, `kg-${w.B}-${i}`, 20);
    await tickAll(w.p, w.B);
    for (let i = 0; i < w.Bs; i++) { const r = await rowState(w.p, w.B, i);
      if (!r.checked || r.kg !== "20" || r.reps === "") return `tick all on filled B: row ${i} not ticked as 20×reps: ${JSON.stringify(r)}`; }
    const ticked = await checkedOnScreen(w.p);
    const fe = await finishViaUi(w); if (fe) return fe;
    return compareSaved(ticked, await persisted(w.p, w.day, w.prog));
  }],
  // 4: clearing kg on an already ticked row (~L36-39) must not leave a ticked blank-kg set
  ["clear kg on ticked row", async w => {
    for (const i of [0, 1]) {
      await padKg(w.p, `kg-${w.B}-${i}`, 20); await padReps(w.p, `rp-${w.B}-${i}`, 10); await tickBox(w.p, `ok-${w.B}-${i}`);
      const r = await rowState(w.p, w.B, i);
      if (!r.checked || r.kg !== "20" || r.reps !== "10") return `set B row ${i} not visibly ticked as 20×10: ${JSON.stringify(r)}`;
    }
    await padClear(w.p, `kg-${w.B}-1`);
    const c1 = await rowState(w.p, w.B, 1);   // Clear must really empty the target row, on screen and in the draft
    if (c1.kg !== "" || c1.dkg !== "") return `Clear did not empty row 1 kg (box="${c1.kg}", draft=${JSON.stringify(c1.dkg)})`;
    const r0 = await rowState(w.p, w.B, 0);
    if (!r0.checked || r0.kg !== "20" || r0.reps !== "10") return `untouched row 0 changed: ${JSON.stringify(r0)}`;
    const blank = await blankTicked(w.p);
    if (blank.length) return `row still ticked after its kg was cleared: ${JSON.stringify(blank)} — set will be dropped on save`;
    const ticked = await checkedOnScreen(w.p);
    const fe = await finishViaUi(w); if (fe) return fe;
    return compareSaved(ticked, await persisted(w.p, w.day, w.prog));
  }],
];

(async () => {
  const srv = await startServer(), base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  let failed = 0;
  try {
    for (const [name, fn] of cases) {
      let msg, w;
      try { w = await freshWorkout(browser, base); msg = await fn(w); } catch (e) { msg = "error: " + e.message.split("\n").filter(Boolean).slice(0, 14).join(" / "); }
      if (w && w.errs.length) msg = (msg ? msg + "; " : "") + "page errors: " + w.errs.join(" | ");
      if (w) await w.ctx.close();
      if (msg) { failed++; console.log("FAIL", name, "→", msg); } else console.log("ok", name);
    }
  } finally { await browser.close(); srv.close(); }
  if (failed) { console.error(`${failed} failing`); process.exitCode = 1; } else console.log("PASS");
})();
