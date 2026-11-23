const assert = require("node:assert/strict");

module.exports = async function shareAfterSave(browser, url) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.clock.setFixedTime(new Date("2026-11-19T12:00:00"));
    await page.goto(url);
    await page.locator("#login").waitFor();
    const past = "2026-11-17";
    const { today, exercise } = await page.evaluate(past => {
      document.getElementById("login").hidden = true;
      setDayMode("train"); pickLoc("gym");
      const exercise = PROGS.push.ex[0].id;
      logs = [
        { date: past, prog: "push", ex: { [exercise]: [{ kg: 40, reps: 8 }] } },
        { date: TODAY, prog: "pull", ex: { [PROGS.pull.ex[0].id]: [{ kg: 30, reps: 10 }] } },
      ];
      save("gymlog", logs); renderSessions();
      const draw = drawCard;
      drawCard = log => { window.drawnWorkout = log; return draw(log); };
      return { today: TODAY, exercise };
    }, past);

    async function checkShare(date, reps) {
      await page.locator(".wt-fin").click();
      const confirm = page.locator("#fin-ok");
      if (await confirm.isVisible()) await confirm.click();
      await page.locator("#share-modal").waitFor();
      const result = await page.evaluate(async date => {
        await document.getElementById("share-img").decode();
        const saved = JSON.parse(localStorage.getItem("gymlog")).find(l => l.date === date && l.prog === "push");
        return { saved, drawn: window.drawnWorkout, filename: shareName };
      }, date);
      assert.equal(result.filename, `workout-${date}-push.png`);
      assert.deepEqual(result.saved.ex[exercise], [{ kg: 40, reps }]);
      assert.deepEqual(result.drawn, result.saved);
      await page.locator("#share-close").click();
    }

    await page.locator("#tab-stats").click();
    await page.locator('#hist-mode [data-m="list"]').click();
    const pastRow = page.locator("#sessions details").filter({ has: page.locator(`[data-mv][value="${past}"]`) });
    await pastRow.locator("summary").click();
    await pastRow.locator("[data-ed]").click();
    if (!await page.locator("#v-gym").isVisible()) await page.locator("#tab-gym").click();
    const repInput = page.locator(`#rp-${exercise}-0`);
    await repInput.click();
    await page.locator('#pad-chips [data-v="12"]').click();
    await checkShare(past, 12);
    console.log("ok share-after-save History edit with a workout today");

    await page.evaluate(() => startPlanItem("push", true));
    await repInput.click();
    await page.locator('#pad-chips [data-v="9"]').click();
    await page.locator("#exs .pg-on .ls-n").first().click();
    await page.locator("#rest-up").click();
    await checkShare(today, 9);
    console.log("ok share-after-save second program today");
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
};
