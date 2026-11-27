// More → Background: built-in manga panel for every tab / one tab, strength, your own photo turned into manga
// line art (kept in IndexedDB) and still there after a reload.
// Run: node tests/bg-picker.cjs
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
  const url = () => `http://127.0.0.1:${srv.address().port}/`;
  const fresh = async () => {
    const ctx = await b.newContext({ viewport: { width: 430, height: 932 } }), p = await ctx.newPage(), errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.goto(url()); await p.waitForFunction(() => typeof openBg === "function" && document.getElementById("bg-open"), null, { timeout: 15000 });
    await p.evaluate(() => { document.getElementById("login").hidden = true; location.hash = "more"; });
    await p.waitForTimeout(200);
    return { p, ctx, errs };
  };
  const before = (p, v) => p.evaluate(v => { const s = getComputedStyle(document.getElementById("v-" + v), "::before"); return { img: s.backgroundImage, op: +s.opacity }; }, v);
  const show = (p, v) => p.evaluate(v => { location.hash = v === "home" ? "" : v; }, v).then(() => p.waitForTimeout(250));
  const tc = async (name, fn) => { const w = await fresh(); try { await fn(w); if (w.errs.length) throw new Error("page errors: " + w.errs.join(" | ")); console.log("ok", name); }
    catch (e) { fails.push(name); console.log("FAIL", name, "→", e.message.split("\n")[0]); } finally { await w.ctx.close(); } };

  await tc("panel on every tab + strength", async ({ p }) => {
    await p.click("#bg-open"); await p.waitForSelector('#gen-body [data-bgc="p:eat"]');
    await p.click('#gen-body [data-bgc="p:eat"]'); await p.click('#gen-body [data-grp="str"] [data-v="strong"]');
    await p.click("#gen-body [data-bgsave]"); await p.waitForTimeout(200);
    for (const v of ["more", "stats"]) { await show(p, v); const s = await before(p, v); assert.match(s.img, /comic-eat/, v + " uses the Eat panel"); assert.ok(Math.abs(s.op - 0.22) < 0.01, "strong = .22"); }
    assert.match(await p.locator("#bg-sum").innerText(), /Eat/);
  });

  await tc("only one tab", async ({ p }) => {
    await p.click("#bg-open"); await p.waitForSelector('#gen-body [data-bgc="none"]');
    await p.click('#gen-body [data-bgc="none"]'); await p.click('#gen-body [data-grp="on"] [data-v="stats"]');
    await p.click("#gen-body [data-bgsave]"); await p.waitForTimeout(200);
    await show(p, "stats"); assert.equal((await before(p, "stats")).img, "none", "Stats has none");
    await show(p, "food"); assert.match((await before(p, "food")).img, /comic-eat/, "Eat keeps its own panel");
  });

  await tc("your photo → manga, saved and kept after reload", async ({ p }) => {
    await p.click("#bg-open"); await p.waitForSelector("#gen-body [data-bgfile]", { state: "attached" });
    await p.setInputFiles("#gen-body [data-bgfile]", path.resolve("public/img/rest-bg.jpg"));
    await p.waitForSelector('#gen-body [data-bgs="tone"]');
    await p.click('#gen-body [data-bgs="tone"]');
    await p.click("#gen-body [data-bguse]"); await p.waitForTimeout(1500);
    const pref = await p.evaluate(() => JSON.parse(localStorage.getItem("bgpref")));
    assert.equal(pref.def, "photo"); assert.equal(pref.style, "tone");
    await show(p, "home"); assert.match((await before(p, "home")).img, /blob:/, "photo is the background");
    // the stored image is black & white
    const bw = await p.evaluate(async () => { const s = getComputedStyle(document.getElementById("v-home"), "::before").backgroundImage.match(/url\("?(.*?)"?\)/)[1];
      const im = new Image(); im.src = s; await im.decode(); const c = document.createElement("canvas"); c.width = 60; c.height = 100; const x = c.getContext("2d"); x.drawImage(im, 0, 0, 60, 100);
      const d = x.getImageData(0, 0, 60, 100).data; let col = 0; for (let i = 0; i < d.length; i += 4) col = Math.max(col, Math.abs(d[i] - d[i + 1]), Math.abs(d[i + 1] - d[i + 2])); return col; });
    assert.ok(bw < 12, "stored image is greyscale");
    await p.reload(); await p.waitForFunction(() => document.getElementById("bg-open"));
    await p.evaluate(() => { document.getElementById("login").hidden = true; }); await p.waitForTimeout(600);
    await show(p, "home"); assert.match((await before(p, "home")).img, /blob:/, "photo still there after reload");
  });

  await b.close(); srv.close();
  if (fails.length) { console.log(fails.length + " failing"); process.exit(1); }
})();
