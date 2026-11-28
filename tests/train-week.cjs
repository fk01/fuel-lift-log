// Train, option G: the week as rows, today as a card. Start / switch place / rest / ⇄ weekly schedule / all programs.
// Run: node tests/train-week.cjs
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
    await p.addInitScript(() => { const T0 = new Date("2026-11-24T10:00:00").getTime(), real = Date.now(), R = Date;   // a Tuesday
      class D extends R { constructor(...a) { if (a.length) super(...a); else super(T0 + (R.now() - real)); } static now() { return T0 + (R.now() - real); } }
      window.Date = D; localStorage.setItem("scheme", "4"); });
    await p.goto(`http://127.0.0.1:${srv.address().port}/`);
    await p.waitForFunction(() => typeof renderPlan === "function" && typeof planList === "function", null, { timeout: 15000 });
    await p.evaluate(() => { document.getElementById("login").hidden = true; location.hash = "gym"; });
    await p.waitForSelector("#locpick .tw", { timeout: 5000 });
    return { p, ctx, errs };
  };
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("seven days: six rows + today's card, old list hidden", async ({ p }) => {
    const s = await p.evaluate(() => ({ rows: document.querySelectorAll("#locpick .tw-row").length, card: document.querySelectorAll("#locpick .tw-card").length,
      old: [...document.querySelectorAll("#locpick .pl-row")].filter(r => r.getBoundingClientRect().height > 0).length,
      ex: document.querySelectorAll("#locpick .tw-card .tw-ex > div").length }));
    assert.equal(s.rows, 6); assert.equal(s.card, 1); assert.equal(s.old, 0, "old rows hidden");
    assert.ok(s.ex >= 3, "today's exercises listed");
  });

  await tc("place switch + Start starts that program", async ({ p }) => {
    const tabs = p.locator("#locpick .tw-tabs [data-twk]");
    if (await tabs.count() > 1) { await tabs.nth(1).click(); await p.waitForTimeout(150); }
    const k = await p.locator('#locpick [data-tw="start"]').getAttribute("data-k");
    await p.locator('#locpick [data-tw="start"]').click(); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => cur), k, "started the chosen program");
    assert.ok(await p.evaluate(() => picked), "workout open");
  });

  await tc("rest today, then train instead", async ({ p }) => {
    await p.locator('#locpick [data-tw="rest"]').click(); await p.waitForTimeout(250);
    assert.equal(await p.evaluate(() => dayMode()), "rest");
    assert.ok(await p.locator('#locpick [data-tw="unrest"]').isVisible());
    await p.locator('#locpick [data-tw="unrest"]').click(); await p.waitForTimeout(250);
    assert.equal(await p.evaluate(() => dayMode()), null);
  });

  await tc("⇄ on Friday puts a program on Fridays", async ({ p }) => {
    await p.locator('#locpick [data-twsw="2026-11-27"]').click();
    await p.waitForSelector("#gen-sheet:not([hidden]) [data-twe]");
    const k = await p.locator("#gen-sheet [data-twe]").first().getAttribute("data-twe");
    const had = await p.evaluate(k => daysOf(k).includes(5), k);
    await p.locator("#gen-sheet [data-twe]").first().click();
    await p.locator("#gen-sheet [data-twsave]").click(); await p.waitForTimeout(300);
    assert.equal(await p.evaluate(k => daysOf(k).includes(5), k), !had, "Friday toggled on the program");
    const fri = await p.locator('#locpick [data-twopen="2026-11-27"]').innerText();
    if (!had) assert.match(fri, new RegExp(await p.evaluate(k => PROGS[k].name, k)));
  });

  await tc("all programs folds open", async ({ p }) => {
    const vis = () => p.evaluate(() => { const e = document.querySelector("#locpick .pl-all"); return !!e && e.getBoundingClientRect().height > 0; });
    assert.equal(await vis(), false);
    await p.locator('#locpick [data-tw="all"]').click(); await p.waitForTimeout(150);
    assert.equal(await vis(), true);
  });

  await tc("in-progress workout: Back, then Discard from the week card", async ({ p }) => {
    await p.locator('#locpick [data-tw="start"]').click(); await p.waitForTimeout(500);
    await p.evaluate(() => { const e = sessEx()[0]; draft.ex[e.id] = [{ kg: 20, reps: "8", ok: true }]; save("gymdraft", draft); });
    await p.locator("#wo-back").click(); await p.waitForTimeout(500);
    const d = p.locator('#locpick [data-tw="discard"]');
    assert.ok(await d.isVisible(), "Discard offered on the card");
    assert.ok(await p.locator('#locpick [data-tw="resume"]').isVisible(), "Resume offered");
    assert.equal(await p.locator("#wo-top").isVisible(), false, "workout bar not floating under the week");
    assert.equal(await p.locator("#locpick .tw-tabs").count(), 0, "card locked to the open workout");
    await d.click();
    await p.locator('#cf-sheet:not([hidden]) [data-cf="1"]').click(); await p.waitForTimeout(400);
    assert.equal(await p.evaluate(() => picked), false, "workout cancelled");
    assert.ok(await p.locator('#locpick [data-tw="start"]').isVisible(), "back to Start");
  });

  await tc("+n more unfolds every exercise, then folds back", async ({ p }) => {
    const more = p.locator("#locpick .tw-card [data-twmore]");
    assert.ok(await more.count() > 0, "program has more than 5 exercises");
    const k = await more.getAttribute("data-twmore"), n = await p.evaluate(k => PROGS[k].ex.length, k);
    await more.click(); await p.waitForTimeout(150);
    assert.equal(await p.locator("#locpick .tw-card .tw-ex > div").count(), n, "all exercises listed");
    await p.locator("#locpick .tw-card [data-twmore]").click(); await p.waitForTimeout(150);
    assert.equal(await p.locator("#locpick .tw-card .tw-ex > div").count(), 5, "folded back to 5");
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
