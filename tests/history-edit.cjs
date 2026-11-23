const assert = require("node:assert/strict");

// Use a separate browser context so the fixture never touches the smoke suite's logs.
module.exports = async function historyEdit(browser, url) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const record = {
    date: "2020-05-14", prog: "push", pn: "Condo push", loc: "condo",
    at: 1589464800000, dur: 1680, note: "  Before work  ",
    names: { "chest-press": "Old bench", retired: "Condo incline press", extra: "Band pull & hold" },
    memo: { retired: "  Slow descent  ", extra: "Red band" },
    ex: {
      "chest-press": [{ kg: 12, reps: 8, side: "both" }],
      retired: [{ kg: 5, reps: 6 }, { kg: 7, reps: 9, effort: 8 }],
      extra: [{ kg: 0, reps: 12 }],
    },
  };
  const legacy = { date: "2020-05-12", prog: "pull", ex: { "lat-pulldown": [{ kg: "18", reps: 4 }] } };
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("gymlog")));
  const open = async index => {
    await page.locator("#tab-stats").click();
    await page.locator('#hist-mode [data-m="list"]').click();
    const row = page.locator("#sessions details").nth(index);
    await row.locator("summary").click();
    await row.locator("[data-ed]").click();
    await page.locator("#v-gym").waitFor();
  };
  const reps = async (id, count) => {
    await page.locator(`#rp-${id}-0`).click();
    await page.locator(`#pad-chips [data-v="${count}"]`).click();
  };
  const finish = async () => {
    await page.locator(".wt-fin").click();
  };
  try {
    await page.goto(url);
    await page.locator("#login").waitFor();
    await page.evaluate(records => {
      document.getElementById("login").hidden = true;
      setDayMode("train");
      pickLoc("gym");
      logs = records;
      save("gymlog", logs);
      renderSessions();
    }, [legacy, record]);

    await open(0);
    await reps("chest-press", 10);
    await finish();
    record.ex["chest-press"][0].reps = 10;
    assert.deepEqual(await stored(), [legacy, record], "editing one rep changed unrelated History data");

    await open(0);
    assert.match(await page.locator("#wo-loc").textContent(), /Condo/);
    assert.equal(await page.locator(".note-in").inputValue(), record.note);
    assert.deepEqual(await page.locator("#exs .mk-t b").allTextContents(), Object.values(record.names));
    await page.locator(".ls-next").click();
    const card = page.locator("#exs .pg-on");
    await card.locator(".ls-del").first().click();
    await page.locator('[data-cf="1"]').click();
    await card.locator(".mk-more").click();
    page.once("dialog", async dialog => {
      assert.equal(dialog.defaultValue(), record.memo.retired);
      await dialog.accept("");
    });
    await page.locator('[data-mk="memo"]').click();
    // Resume an in-progress edit without committing it during startup.
    await page.reload();
    await page.locator("#login").waitFor();
    await page.evaluate(() => { document.getElementById("login").hidden = true; });
    assert.deepEqual(await stored(), [legacy, record]);
    await reps("retired", 11);
    await finish();
    record.ex.retired.shift();
    record.ex.retired[0].reps = 11;
    delete record.memo.retired;
    assert.deepEqual(await stored(), [legacy, record], "deleted set or cleared memo reappeared");
    assert.equal(await page.evaluate(() => curLoc), "gym");

    const program = await page.evaluate(() => PROGS.push);
    await open(0);
    await page.locator(".ls-next").click();
    await page.locator(".ls-next").click();
    await card.locator(".ls-del").click();
    await page.locator('[data-cf="1"]').click();
    await finish();
    await page.locator("#fin-ok").click();
    delete record.ex.extra;
    delete record.names.extra;
    delete record.memo.extra;
    assert.deepEqual(await stored(), [legacy, record], "explicit exercise removal was lost");
    assert.deepEqual(await page.evaluate(() => PROGS.push), program, "History changed the live program");

    await open(1);
    await reps("lat-pulldown", 5);
    await finish();
    legacy.ex["lat-pulldown"][0].reps = 5;
    assert.deepEqual(await stored(), [legacy, record], "legacy entry gained or lost unrelated fields");

    const today = { ...structuredClone(legacy), date: await page.evaluate(() => TODAY), at: 123456 };
    await page.evaluate(entry => {
      logs.push(entry); save("gymlog", logs); setDayMode(null); renderSessions();
    }, today);
    await open(0);
    await reps("lat-pulldown", 7);
    await finish();
    today.ex["lat-pulldown"] = [{ kg: "18", reps: 7 }];
    assert.deepEqual((await stored()).at(-1), today, "editing today's entry replaced its timestamp");
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
};
