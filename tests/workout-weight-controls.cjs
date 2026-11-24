// Run with: node tests/workout-weight-controls.cjs
const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { extname, join } = require("node:path");
const { chromium } = require("playwright");

const day = "2026-11-19";
const prog = "weight-controls";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
let server, base, browser;

before(async () => {
  server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    if (pathname.startsWith("/api")) {
      res.writeHead(401, { "content-type": "application/json" }).end("{}");
      return;
    }
    const file = pathname === "/" ? "index.html" : pathname;
    try {
      const data = await readFile(join("public", file));
      res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function workoutPage(t, viewport = { width: 430, height: 932 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  t.after(async () => {
    await page.close();
    assert.deepEqual(errors, []);
  });
  await page.addInitScript(day => {
    const RealDate = Date, start = new RealDate(`${day}T10:00:00`).getTime(), now = RealDate.now();
    window.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [Date.now()])); }
      static now() { return start + RealDate.now() - now; }
    };
    localStorage.setItem("scheme", "4");
  }, day);
  await page.goto(base);
  await page.waitForFunction(() => typeof startPlanItem === "function" && typeof renderGym === "function");
  page.setDefaultTimeout(5000);
  return page;
}

async function workout(t, { bodyweight = false, priorWeight = false, legacy = false, viewport } = {}) {
  const page = await workoutPage(t, viewport);
  await page.evaluate(({ prog, bodyweight, priorWeight, legacy }) => {
    document.getElementById("login").hidden = true;
    location.hash = "gym";
    cancelProg();
    setDayMode("train");
    pickLoc("gym");
    const first = bodyweight ? subExObj("crunch") : { id: "chest-press", n: "Chest Press", z: "🔩" };
    PROGS[prog] = { name: "Weight controls", loc: "gym", ex: [
      { ...first, s: 2, r: "10-12" },
      { id: "incline-db", n: "Incline Dumbbell Press", z: "🏋️", s: 2, r: "8-10" },
    ] };
    if (priorWeight) logs.push({ date: "2026-11-18", prog, loc: "gym", ex: { "chest-press": [{ kg: 10, reps: 10 }] } });
    startPlanItem(prog, true);
    if (legacy) {
      draft.ex["chest-press"] = [{ kg: "", reps: "10", ok: true }, { kg: 20, reps: "10", ok: true }];
      save("gymdraft", draft);
      renderGym();
    }
  }, { prog, bodyweight, priorWeight, legacy });
  return page;
}

async function tick(page, id) {
  await page.click(`#ok-${id}`);
  const rest = page.locator("#rest:not([hidden]) #rest-up");
  if (await rest.isVisible()) await rest.click();
}

async function tickAll(page, ex) {
  await page.click(`.ex:has(#ok-${ex}-0) .mk-more`);
  await page.click('#gen-sheet:not([hidden]) [data-mk="all"]');
}

async function enterWeight(page, id, step) {
  await page.click(`#kg-${id}`);
  await page.click(`#pad-steps button[data-d="${step}"]`);
  await page.click("#pad-done");
}

async function finish(page) {
  await page.click(".wt-fin");
  await page.click('#gen-sheet:not([hidden]) #fin-ok, #cf-sheet:not([hidden]) [data-cf="1"]');
}

const savedSets = page => page.evaluate(({ day, prog }) => JSON.parse(localStorage.getItem("gymlog") || "[]")
  .find(log => log.date === day && log.prog === prog)?.ex, { day, prog });

for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`mobile touch targets and typography meet their minimums at ${viewport.width}×${viewport.height}`, async t => {
    const page = await workout(t, { viewport, priorWeight: true });
    const assertTargets = async selector => {
      const targets = await page.locator(selector).all();
      assert.ok(targets.length, `Expected to find ${selector}`);
      for (const target of targets) {
        const box = await target.boundingBox();
        assert.ok(box && box.width >= 44 && box.height >= 44, `${target}: ${JSON.stringify(box)}`);
      }
    };
    const assertFontSize = async (selector, minimum) => {
      const sizes = await page.locator(selector).evaluateAll(elements =>
        elements.map(element => parseFloat(getComputedStyle(element).fontSize)));
      assert.ok(sizes.length && sizes.every(size => size >= minimum), `${selector}: ${sizes.join(", ")}`);
    };

    await assertTargets(".tabbar .tab:visible, .ex.pg-on :is(.ls-add, .ls-del, .ls-n input, .mk-more)");
    await assertFontSize(".ex.pg-on input[type=number]", 16);

    await page.emulateMedia({ reducedMotion: "reduce" });
    const assertToastClearance = async selectors => {
      const gaps = await page.evaluate(selectors => {
        toast("A workout notification long enough to wrap on a narrow screen. The workout controls must remain visible.");
        const message = document.getElementById("toast").getBoundingClientRect();
        return selectors.map(selector => document.querySelector(selector).getBoundingClientRect().top - message.bottom);
      }, selectors);
      assert.ok(gaps.every(gap => gap >= 8), `${selectors.join(", ")} toast clearance: ${gaps.join(", ")}px`);
    };
    await assertToastClearance([".tabbar", "#wo-add"]);

    // The current workout uses a header Finish button. Exercise the bottom bar layout as well.
    await page.locator(".wo-bar").evaluate(bar => {
      bar.style.setProperty("display", "flex", "important");
      bar.style.setProperty("position", "fixed", "important");
      bar.style.setProperty("bottom", "150px", "important");
    });
    await assertToastClearance([".wo-bar"]);

    await page.locator("#tab-home").click();
    await page.locator("#v-home .hq-day small").first().waitFor();
    await assertToastClearance([".tabbar"]);
    await assertFontSize("#v-home .hq-day small", 12);

    await page.locator("#tab-stats").click();
    await page.locator("#hist-plot svg text").first().waitFor();
    await assertFontSize("#hist-plot svg text", 12);

    await page.locator("#tab-more").click();
    await page.locator("#lib-open").click();
    await page.locator("#lib-list .how-btn").first().waitFor();
    await assertTargets("#lib-list .how-btn:visible");
    await page.locator("#lib-close").click();

    await page.evaluate(() => {
      pmOnly = "push";
      renderPM();
      document.getElementById("pm-modal").hidden = false;
    });
    await assertFontSize("#pm-body .pm-n input[type=number]", 16);
  });
}

test("bodyweight with blank or cleared kg ticks and saves as zero load", async t => {
  const page = await workout(t, { bodyweight: true });
  const kg = page.locator("#kg-crunch-0");
  assert.equal(await kg.inputValue(), "");
  await tick(page, "crunch-0");
  assert.equal(await page.locator("#ok-crunch-0").isChecked(), true);
  await enterWeight(page, "crunch-0", 10);
  await kg.click();
  await page.click("#pad-clear");
  assert.equal(await kg.inputValue(), "");
  assert.equal(await page.locator("#ok-crunch-0").isChecked(), true);
  await tickAll(page, "crunch");
  assert.equal(await page.locator("#ok-crunch-1").isChecked(), true);
  await finish(page);
  assert.deepEqual(await savedSets(page), { crunch: [{ kg: 0, reps: 10 }, { kg: 0, reps: 10 }] });
});

test("explicit zero stays ticked and saves even with positive weight history", async t => {
  const page = await workout(t, { priorWeight: true });
  assert.equal(await page.locator("#kg-chest-press-0").inputValue(), "10");
  await enterWeight(page, "chest-press-0", -10);
  await tick(page, "chest-press-0");
  assert.equal(await page.locator("#ok-chest-press-0").isChecked(), true);
  assert.equal(await page.locator("#kg-chest-press-0").inputValue(), "0");
  await finish(page);
  assert.deepEqual(await savedSets(page), { "chest-press": [{ kg: 0, reps: 10 }] });
});

test("explicit zero saves on the first workout", async t => {
  const page = await workout(t);
  await enterWeight(page, "chest-press-0", -10);
  await tick(page, "chest-press-0");
  assert.equal(await page.locator("#ok-chest-press-0").isChecked(), true);
  await finish(page);
  assert.deepEqual(await savedSets(page), { "chest-press": [{ kg: 0, reps: 10 }] });
});

test("Tick all completes a zero-weight row and leaves the blank weighted row unticked", async t => {
  const page = await workout(t);
  await enterWeight(page, "chest-press-0", -10);
  await tickAll(page, "chest-press");
  assert.equal(await page.locator("#ok-chest-press-0").isChecked(), true);
  assert.equal(await page.locator("#kg-chest-press-0").inputValue(), "0");
  assert.equal(await page.locator("#ok-chest-press-1").isChecked(), false);
  assert.equal(await page.locator("#kg-chest-press-1").inputValue(), "");
  await finish(page);
  assert.deepEqual(await savedSets(page), { "chest-press": [{ kg: 0, reps: 10 }] });
});

test("Finish keeps an older draft intact until its ticked blank weight is fixed", async t => {
  const page = await workout(t, { legacy: true });
  await finish(page);
  assert.equal(await savedSets(page), undefined);
  const rows = await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft")).ex["chest-press"]);
  assert.deepEqual(rows, [{ kg: "", reps: "10", ok: true }, { kg: 20, reps: "10", ok: true }]);
  assert.equal(await page.locator("#toast").textContent(), await page.evaluate(() => t("เซ็ตที่ติ๊กยังไม่ได้ใส่น้ำหนัก")));
  await enterWeight(page, "chest-press-0", 10);
  await finish(page);
  assert.deepEqual(await savedSets(page), { "chest-press": [{ kg: 10, reps: 10 }, { kg: 20, reps: 10 }] });
});

const draftDay = "2026-11-18";
const todayPush = { date: day, prog: "push", loc: "gym", note: "Today's Push",
  ex: { "chest-press": [{ kg: 40, reps: 8 }] } };

async function resumeOvernightPush(t) {
  const page = await workoutPage(t);
  await page.evaluate(({ draftDay, todayPush }) => {
    localStorage.setItem("gymlog", JSON.stringify([todayPush]));
    localStorage.setItem("gymdraft", JSON.stringify({ day: draftDay, prog: "push", started: 1, loc: "gym",
      ex: { "chest-press": [{ kg: "", reps: "10", ok: true }] } }));
    location.hash = "gym";
  }, { draftDay, todayPush });
  await page.reload();
  await page.locator("#login").waitFor();
  await page.evaluate(() => {
    document.getElementById("login").hidden = true;
    setDayMode("train"); renderGym();
  });
  assert.equal(await page.evaluate(() => DAY), day);
  assert.equal(await page.locator("#ok-chest-press-0").isChecked(), true);
  assert.equal(await page.locator("#kg-chest-press-0").inputValue(), "");
  // The previous 40 kg is suggested by the keypad. One +10 step repairs the draft.
  await enterWeight(page, "chest-press-0", 10);
  assert.equal(await page.locator("#kg-chest-press-0").inputValue(), "50");
  return page;
}

test("finishing the Nov 18 Push on Nov 19 preserves both workouts after reload", async t => {
  const page = await resumeOvernightPush(t);
  const editedDay = await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft")).day);
  await finish(page);
  await page.locator("#share-modal").waitFor();
  assert.equal(await page.evaluate(() => shareName), "workout-2026-11-18-push.png");
  await page.reload();
  const logs = await page.evaluate(() => JSON.parse(localStorage.getItem("gymlog")));
  assert.deepEqual(logs.map(l => [l.date, l.prog, l.ex]), [
    [draftDay, "push", { "chest-press": [{ kg: 50, reps: 10 }] }],
    [day, "push", todayPush.ex],
  ]);
  assert.deepEqual(logs[1], todayPush);
  assert.equal(editedDay, draftDay);
});

test("a workout saved into the draft's own slot in another tab survives Finish and auto-save", async t => {
  const page = await resumeOvernightPush(t);
  const occupied = [{ ...todayPush, date: draftDay, note: "Already saved for Nov 18" }, todayPush];
  await page.evaluate(logs => localStorage.setItem("gymlog", JSON.stringify(logs)), occupied);
  await finish(page);
  assert.match(await page.locator("#toast").textContent(), /already saved/i);
  await page.reload();
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("gymlog"))), occupied);
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft")));
  assert.equal(draft.day, draftDay);
  assert.deepEqual(draft.ex["chest-press"], [{ kg: 50, reps: "10", ok: true }]);
});

test("History can re-tick imported bodyweight sets with null and omitted kg", async t => {
  const page = await workoutPage(t);
  const record = { date: draftDay, prog: "push", loc: "gym", ex: { crunch: [{ kg: null, reps: 12 }, { reps: 9 }] } };
  await page.evaluate(record => {
    document.getElementById("login").hidden = true;
    logs = [record]; save("gymlog", logs);
    openHistoryEdit(logs[0]);
  }, record);
  await tick(page, "crunch-1");
  await tick(page, "crunch-0");
  await tick(page, "crunch-0");
  assert.equal(await page.locator("#ok-crunch-0").isChecked(), true);
  await tickAll(page, "crunch");
  assert.equal(await page.locator("#ok-crunch-1").isChecked(), true);
  await page.click(".wt-fin");
  await page.reload();
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("gymlog"))), [record]);
});
