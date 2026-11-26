// Eat, option B: next meal card + one line per other meal. "Ate it" ticks the meal (and its folded vitamins)
// and the card moves on to the following meal; a row expands to show its foods and can be ticked/unticked.
// Run: node tests/eat-next.cjs
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
    await p.waitForFunction(() => typeof renderNourish === "function" && document.querySelector("#nourish .en-hero"), null, { timeout: 15000 });
    await p.evaluate(() => { document.getElementById("login").hidden = true; location.hash = "food"; });
    await p.waitForTimeout(300);
    return { p, ctx, errs };
  };
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("one card for the next meal, one line for each other meal", async ({ p }) => {
    const s = await p.evaluate(() => ({ hero: document.querySelectorAll("#nourish .en-hero").length, rows: document.querySelectorAll("#nourish .en-row").length,
      nonVit: mealList().filter(m => !m.vit).length, old: document.querySelectorAll("#nourish .dm").length,
      nm: document.querySelector("#nourish .en-nm").textContent, first: t(mealList().filter(m => !m.vit).sort((a, b) => a.time.localeCompare(b.time))[0].name) }));
    assert.equal(s.hero, 1);
    assert.equal(s.rows, s.nonVit - 1, "every other meal is one line (vitamins folded)");
    assert.equal(s.old, 0, "no per-meal cards");
    assert.equal(s.nm, s.first, "card = first meal not eaten");
  });

  await tc("Ate it ticks the meal + its vitamins and moves the card on", async ({ p }) => {
    const ids = (await p.locator("#nourish .en-hero [data-en-tick]").getAttribute("data-en-tick")).split(",");
    const nm0 = await p.locator("#nourish .en-nm").innerText();
    await p.locator("#nourish .en-hero [data-en-tick]").click();
    await p.waitForTimeout(300);
    const done = await p.evaluate(() => (JSON.parse(localStorage.getItem("mealcheck"))["2026-11-26"] || {}).done || {});
    ids.forEach(id => assert.ok(done[id], "ticked " + id));
    assert.notEqual(await p.locator("#nourish .en-nm").innerText(), nm0, "card moved to the next meal");
    assert.ok(await p.locator("#nourish .en-row.done").count() >= 1, "eaten meal is a done line");
  });

  await tc("a line expands and can be ticked, then unticked", async ({ p }) => {
    const row = p.locator("#nourish .en-row").first();
    await row.locator("[data-en-open]").click(); await p.waitForTimeout(200);
    const r2 = p.locator("#nourish .en-row.open");
    assert.ok(await r2.locator(".en-items li").count() >= 1, "foods shown");
    const id = (await r2.locator("[data-en-tick]").getAttribute("data-en-tick")).split(",")[0];
    await r2.locator("[data-en-tick]").click(); await p.waitForTimeout(250);
    assert.ok(await p.evaluate(id => mealDone(id), id), "ticked");
    await p.locator("#nourish .en-row.open [data-en-tick]").click(); await p.waitForTimeout(250);
    assert.ok(!(await p.evaluate(id => mealDone(id), id)), "unticked");
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
