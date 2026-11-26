// Today, option P4: TRAIN group + EAT timeline + My body (no game bars). Ticking a meal counts it; Start opens the workout.
// Run: node tests/home-quest.cjs
const { chromium } = require("playwright");
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve("public"), types = { js: "text/javascript", css: "text/css", png: "image/png", jpg: "image/jpeg", json: "application/json" };
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
    await p.addInitScript(() => { const T0 = new Date("2026-11-26T10:00:00").getTime(), real = Date.now(), R = Date;
      class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
      window.Date = D; localStorage.setItem("scheme", "4"); });
    await p.goto(`http://127.0.0.1:${srv.address().port}/`);
    await p.waitForFunction(() => typeof renderHome === "function" && document.querySelector("#v-home .hq-quest"), null, { timeout: 15000 });
    await p.evaluate(() => { document.getElementById("login").hidden = true; location.hash = ""; renderHome(); });
    await p.waitForTimeout(300);
    return { p, ctx, errs };
  };
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("train group + one row per meal (vitamins folded), old cards hidden, body kept", async ({ p }) => {
    const s = await p.evaluate(() => ({ bars: document.querySelectorAll("#v-home .hqq-b").length,
      meals: document.querySelectorAll("#v-home .hqq-r.q-meal").length, n: mealList().filter(m => !m.vit).length, all: mealList().length,
      train: document.querySelectorAll("#v-home .hqq-tr [data-hqp]").length, plan: planList().filter(q => PROGS[q]).length,
      oldEat: getComputedStyle(document.querySelector("#v-home [data-other]").closest("section")).display,
      body: getComputedStyle(document.querySelector("#v-home .hq-body")).display,
      now: !!document.querySelector("#v-home .hqq-now") }));
    assert.equal(s.bars, 0, "no HP/SP/EXP bars");
    assert.ok(s.meals <= s.all && s.meals >= s.n, "one row per meal");
    assert.equal(s.train, s.plan, "every planned workout is in Train");
    assert.equal(s.oldEat, "none", "old Eat card hidden");
    assert.notEqual(s.body, "none", "My body stays");
    assert.ok(s.now, "NOW marker today");
  });

  await tc("ticking a meal counts it, adds kcal and ticks its vitamins", async ({ p }) => {
    const ids = await p.evaluate(() => document.querySelector("#v-home .hqq-ck").dataset.hqm.split(","));
    const k = await p.evaluate(id => +mealList().find(m => m.id === id).k, ids[0]);
    await p.locator("#v-home .hqq-ck").first().click();
    await p.waitForTimeout(200);
    assert.equal(await p.locator("#v-home .hqq-ck").first().getAttribute("aria-pressed"), "true");
    assert.match(await p.locator("#v-home .hqq-h").nth(1).innerText(), /·\s*1\/\d+/);
    assert.ok((await p.locator("#v-home .hqq-kc").innerText()).startsWith(k.toLocaleString()), "kcal total");
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("mealcheck"))["2026-11-26"].done);
    ids.forEach(id => assert.ok(saved[id], "saved " + id));
  });

  await tc("Start opens the workout on Train", async ({ p }) => {
    const go = p.locator("#v-home .hqq-go[data-hqs]").first();
    if (!await go.count()) { console.log("  (no workout planned today — skipped)"); return; }
    await go.click(); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => location.hash), "#gym");
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
