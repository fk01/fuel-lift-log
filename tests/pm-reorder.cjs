// Program editor reorder: dragging the number circle moves the exercise; Move up via ⋯ keeps the scroll position.
// Run: node tests/pm-reorder.cjs
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
    const ctx = await b.newContext({ viewport: { width: 390, height: 700 }, hasTouch: false }), p = await ctx.newPage(), errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${srv.address().port}/`);
    await p.waitForFunction(() => typeof pmExRows === "function" && typeof renderPM === "function", null, { timeout: 15000 });
    const k = await p.evaluate(() => { document.getElementById("login").hidden = true;
      const k = Object.keys(PROGS).sort((a, b) => (PROGS[b].ex || []).length - (PROGS[a].ex || []).length)[0];
      pmOnly = k; renderPM(); document.getElementById("pm-modal").hidden = false; return k; });
    await p.waitForTimeout(400);
    return { p, ctx, errs, k };
  };
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("drag the number moves the exercise down", async ({ p, k }) => {
    const before = await p.evaluate(k => PROGS[k].ex.map(e => e.id), k);
    assert.ok(before.length >= 3, "program has 3+ exercises");
    const rows = p.locator("#pm-modal .pm-row");
    await rows.nth(2).scrollIntoViewIfNeeded();
    const h0 = await rows.nth(0).locator(".pi-no").boundingBox(), r2 = await rows.nth(2).boundingBox();
    await p.mouse.move(h0.x + h0.width / 2, h0.y + h0.height / 2); await p.mouse.down();
    for (let s = 1; s <= 12; s++) await p.mouse.move(h0.x + h0.width / 2, h0.y + h0.height / 2 + (r2.y + r2.height * .75 - h0.y) * s / 12);
    await p.mouse.up(); await p.waitForTimeout(250);
    const after = await p.evaluate(k => PROGS[k].ex.map(e => e.id), k);
    assert.equal(after[2], before[0], "first exercise is now third");
    assert.deepEqual(after.slice(0, 2), before.slice(1, 3), "the two below moved up");
    assert.equal(await p.locator("#pm-modal .pm-row").first().locator("b").first().innerText().then(s => s.replace("🔒 ", "")), await p.evaluate(k => PROGS[k].ex[0].n, k), "list re-rendered");
  });

  await tc("tap on the number (no move) changes nothing", async ({ p, k }) => {
    const before = await p.evaluate(k => PROGS[k].ex.map(e => e.id), k);
    await p.locator("#pm-modal .pm-row .pi-no").nth(1).click(); await p.waitForTimeout(150);
    assert.deepEqual(await p.evaluate(k => PROGS[k].ex.map(e => e.id), k), before);
  });

  await tc("Move up keeps the scroll position", async ({ p, k }) => {
    const n = await p.evaluate(k => PROGS[k].ex.length, k);
    const row = p.locator("#pm-modal .pm-row").nth(n - 1);
    await row.scrollIntoViewIfNeeded();
    const sc = () => p.evaluate(() => { const m = document.getElementById("pm-modal"); return m.scrollTop; });
    const s0 = await sc();
    assert.ok(s0 > 0, "editor is scrolled");
    await row.locator(".pm-more2").click();
    await p.locator('#gen-sheet [data-pmx="up"]').click(); await p.waitForTimeout(300);
    const s1 = await sc();
    assert.ok(Math.abs(s1 - s0) < 4, `scroll stayed (${s0} → ${s1})`);
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
