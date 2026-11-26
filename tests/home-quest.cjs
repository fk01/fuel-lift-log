// Today, option F: HP/SP/EXP bars + quests timeline. Ticking a meal adds to HP/SP; Start opens the workout.
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

  await tc("bars + one row per meal and planned workout, old cards hidden", async ({ p }) => {
    const s = await p.evaluate(() => ({ bars: [...document.querySelectorAll("#v-home .hqq-b .hqq-k")].map(x => x.textContent),
      meals: document.querySelectorAll("#v-home .hqq-r.q-meal").length, n: mealList().length,
      train: document.querySelectorAll("#v-home .hqq-r.q-train").length, plan: planList().length,
      oldEat: getComputedStyle(document.querySelector("#v-home [data-other]").closest("section")).display,
      now: !!document.querySelector("#v-home .hqq-now") }));
    assert.deepEqual(s.bars.slice(0, 2), ["HP", "SP"]);
    assert.equal(s.meals, s.n, "every meal is a quest");
    assert.equal(s.train, s.plan, "every planned workout is a quest");
    assert.equal(s.oldEat, "none", "old Eat card hidden");
    assert.ok(s.now, "NOW marker today");
  });

  await tc("ticking a meal fills HP and counts the quest", async ({ p }) => {
    const m = await p.evaluate(() => mealList().find(x => +x.k > 0));
    const hp0 = await p.locator('#v-home [data-hqq="hp"] .hqq-v').innerText();
    await p.locator(`#v-home .hqq-ck[data-hqm="${m.id}"]`).click();
    await p.waitForTimeout(200);
    const hp1 = await p.locator('#v-home [data-hqq="hp"] .hqq-v').innerText();
    assert.notEqual(hp1, hp0, "HP changed");
    assert.ok(hp1.startsWith((+m.k).toLocaleString()), `HP shows ${m.k} (got ${hp1})`);
    assert.equal(await p.locator(`#v-home .hqq-ck[data-hqm="${m.id}"]`).getAttribute("aria-pressed"), "true");
    assert.match(await p.locator("#v-home .hqq-h").innerText(), /1\/\d+/i);
    assert.ok(await p.evaluate(id => !!JSON.parse(localStorage.getItem("mealcheck"))["2026-11-26"].done[id], m.id), "saved");
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
