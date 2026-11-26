// One-page workout list + "Replace" (today only).
// Checks: every exercise is on the page (current card + one-line rows); tapping a row opens that exercise;
// Replace swaps the exercise for today without touching the program; the saved workout uses the new
// exercise; Undo restores the original; the old "paired exercise" (⇄ alt) button is gone.
// Run: node tests/workout-replace.cjs
const { chromium } = require("playwright");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve("public"), types = { js: "text/javascript", css: "text/css", png: "image/png", gif: "image/gif", json: "application/json" };
const srv = http.createServer((q, r) => {
  if (q.url.startsWith("/api")) { r.writeHead(401, { "content-type": "application/json" }); return r.end("{}"); }
  const f = path.join(root, q.url === "/" ? "index.html" : decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": types[f.split(".").pop()] || "text/html" }); r.end(d); });
});

(async () => {
  await new Promise(res => srv.listen(0, "127.0.0.1", res));
  const b = await chromium.launch(), fails = [];
  const fresh = async () => {
    const ctx = await b.newContext({ viewport: { width: 430, height: 932 } }), p = await ctx.newPage(), errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.addInitScript(() => { const T0 = new Date("2026-11-19T10:00:00").getTime(), real = Date.now(), R = Date;
      class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
      window.Date = D; localStorage.setItem("scheme", "4"); });
    await p.goto(`http://127.0.0.1:${srv.address().port}/`);
    await p.waitForFunction(() => typeof startPlanItem === "function" && typeof woListify === "function", null, { timeout: 15000 });
    await p.evaluate(() => { document.getElementById("login").hidden = true; location.hash = "gym"; cancelProg(); setDayMode("train"); pickLoc("gym"); startPlanItem("push", true); });
    await p.waitForTimeout(700);
    return { p, ctx, errs };
  };
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("all exercises on one page", async ({ p }) => {
    const s = await p.evaluate(() => ({ cards: document.querySelectorAll("#exs>.ex").length, mini: document.querySelectorAll("#exs>.ex.wl-mini .wl-row").length,
      cur: document.querySelectorAll("#exs>.ex.pg-on").length, n: sessEx().length, alt: document.querySelectorAll("#exs [data-alt]").length,
      vis: [...document.querySelectorAll("#exs .wl-row")].filter(r => r.getBoundingClientRect().height > 0).length }));
    assert.equal(s.cur, 1, "one expanded card");
    assert.equal(s.mini, s.n - 1, "every other exercise is a one-line row");
    assert.equal(s.vis, s.n - 1, "rows are visible");
    assert.equal(s.alt, 0, "no paired-exercise (alt) button");
  });

  await tc("tap a row opens that exercise", async ({ p }) => {
    const want = await p.evaluate(() => sessEx()[2].id);
    await p.locator("#exs>.ex").nth(2).locator(".wl-row").click();
    await p.waitForTimeout(200);
    assert.equal(await p.evaluate(() => sessEx()[woIdx].id), want);
    assert.ok(await p.evaluate(() => document.querySelectorAll("#exs>.ex")[2].classList.contains("pg-on")));
  });

  await tc("replace is today only and saved with the new exercise", async ({ p }) => {
    const before = await p.evaluate(() => ({ prog: PROGS.push.ex[0].id, cur: sessEx()[0].id }));
    await p.click("#exs .pg-on .wl-rep");
    await p.waitForSelector("#gen-sheet:not([hidden]) .rp-opt");
    const picked = await p.evaluate(() => document.querySelector("#gen-sheet .rp-opt").dataset.rp);
    await p.click("#gen-sheet .rp-opt");
    await p.waitForTimeout(250);
    const after = await p.evaluate(() => ({ prog: PROGS.push.ex[0].id, cur: sessEx()[0].id, was: !!document.querySelector("#exs .pg-on .wl-was") }));
    assert.equal(after.prog, before.prog, "program untouched");
    assert.equal(after.cur, picked, "session uses the replacement");
    assert.ok(after.was, "card shows 'replaced …' tag");
    // log one set of the new exercise and save
    const rec = await p.evaluate(() => { const e = sessEx()[0]; draft.ex[e.id] = [{ kg: 20, reps: "8", ok: true }]; save("gymdraft", draft); return newWorkoutRecord(TODAY, "push"); });
    assert.ok(rec && rec.ex[picked], "saved record has the new exercise");
    assert.ok(!rec.ex[before.cur], "untouched original is not in the record");
  });

  await tc("undo bar restores the original exercise", async ({ p }) => {
    const orig = await p.evaluate(() => sessEx()[0].id);
    await p.click("#exs .pg-on .wl-rep");
    await p.waitForSelector("#gen-sheet:not([hidden]) .rp-opt");
    await p.click("#gen-sheet .rp-opt");
    await p.waitForSelector("#undo-bar:not([hidden]) [data-undo]", { timeout: 3000, state: "attached" });
    assert.notEqual(await p.evaluate(() => sessEx()[0].id), orig);
    await p.evaluate(() => document.querySelector("#undo-bar [data-undo]").click());
    await p.waitForTimeout(300);
    assert.equal(await p.evaluate(() => sessEx()[0].id), orig, "undo brings the original back");
  });

  await tc("ticked original is kept in the record when replaced", async ({ p }) => {
    const orig = await p.evaluate(() => { const e = sessEx()[0]; draft.ex[e.id] = [{ kg: 30, reps: "8", ok: true }]; save("gymdraft", draft); renderEx(); return e.id; });
    await p.click("#exs .pg-on .wl-rep");
    await p.waitForSelector("#gen-sheet:not([hidden]) .rp-opt");
    const picked = await p.evaluate(() => document.querySelector("#gen-sheet .rp-opt").dataset.rp);
    await p.click("#gen-sheet .rp-opt");
    await p.waitForTimeout(200);
    const rec = await p.evaluate(id => { draft.ex[id] = [{ kg: 20, reps: "8", ok: true }]; return newWorkoutRecord(TODAY, "push"); }, picked);
    assert.ok(rec.ex[orig], "ticked original kept");
    assert.ok(rec.ex[picked], "replacement saved");
  });

  await tc("replace while editing a past workout moves its sets", async ({ p }) => {
    await p.evaluate(() => { cancelProg(); logs = [{ date: "2026-11-12", prog: "push", loc: "gym", ex: { "chest-press": [{ kg: 40, reps: 8 }, { kg: 40, reps: 7 }], "incline-db": [{ kg: 12, reps: 8 }] } }]; save("gymlog", logs); renderSessions(); });
    await p.locator("#tab-stats").click();
    await p.locator('#hist-mode [data-m="list"]').click();
    const row = p.locator("#sessions details").first();
    if (!await row.evaluate(el => el.open)) await row.locator("summary").click();
    await row.locator("[data-ed]").click();
    await p.waitForTimeout(600);
    const first = await p.evaluate(() => sessEx()[woIdx].id);
    assert.equal(first, "chest-press");
    assert.ok(await p.locator("#exs .pg-on .wl-rep").isVisible(), "Replace offered in history edit");
    await p.click("#exs .pg-on .wl-rep");
    await p.waitForSelector("#gen-sheet:not([hidden]) .rp-opt");
    const picked = await p.evaluate(() => document.querySelector("#gen-sheet .rp-opt").dataset.rp);
    await p.click("#gen-sheet .rp-opt");
    await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => !!document.querySelector("#exs .pg-on .wl-was")), "replaced tag");
    await p.locator(".wt-fin").click();
    const ok = p.locator('#gen-sheet:not([hidden]) #fin-ok, #cf-sheet:not([hidden]) [data-cf="1"]').first();
    if (await ok.isVisible().catch(() => false)) await ok.click();
    await p.waitForTimeout(400);
    const log = await p.evaluate(() => JSON.parse(localStorage.getItem("gymlog")).find(l => l.date === "2026-11-12"));
    assert.ok(log, "log still there");
    assert.ok(!log.ex["chest-press"], "old exercise gone from the log");
    assert.deepEqual(log.ex[picked].map(x => [x.kg, x.reps]), [[40, 8], [40, 7]], "sets moved to the new exercise");
    assert.ok(log.ex["incline-db"], "other exercises untouched");
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
