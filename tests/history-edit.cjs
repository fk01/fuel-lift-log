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
  const select = async index => {
    await page.locator("#tab-stats").click();
    await page.locator('#hist-mode [data-m="list"]').click();
    const row = page.locator("#sessions details").nth(index);
    if (!await row.evaluate(el => el.open)) await row.locator("summary").click();
    await row.locator("[data-ed]").click();
  };
  const open = async index => {
    await select(index);
    await page.locator("#v-gym").waitFor();
  };
  const reps = async (id, count) => {
    await page.locator(`#rp-${id}-0`).click();
    await page.locator(`#pad-chips [data-v="${count}"]`).click();
  };
  const finish = async () => {
    await page.locator(".wt-fin").click();
  };
  const seed = records => page.evaluate(items => {
    logs = items; save("gymlog", logs); renderSessions();
  }, records);
  async function checkLegacyDraft() {
    const original = {
      date: record.date, prog: "push", loc: "condo", at: record.at, note: "Original workout note",
      names: { retired: "Old press", removed: "Old row", twins: "Hold", curl: "Old curl", press: "Strict press" },
      memo: { retired: "Slow", removed: "Elastic" },
      ex: {
        retired: [{ kg: 5, reps: 6, tag: "A" }, { kg: 7, reps: 9, tag: "B" }],
        removed: [{ kg: 9, reps: 4 }],
        twins: [{ kg: 0, reps: 5, tag: "left" }, { kg: 0, reps: 5, tag: "right" }],
        curl: [{ kg: null, reps: 8 }],
        press: [{ kg: 7, reps: 9, tag: "original set" }],
      },
    };
    await seed([original]);
    await page.evaluate(log => {
      // Old Edit sets stored checked rows, omitted a deleted exercise, and
      // had no source indices. The remaining identical set has no identity.
      const prior = { fromHist: 1, started: 1, day: log.date, prog: log.prog,
        note: "Updated before upgrade", loc: "gym", memo: { retired: "Use bands" },
        // 5×6 could be the 7×9 set edited after the 5×6 set was deleted.
        ex: { retired: [{ kg: 5, reps: "6", ok: true }], twins: [{ kg: 0, reps: "5", ok: true }],
          curl: [{ kg: null, reps: "12", ok: true }], press: [{ kg: 7, reps: "10", ok: true, sourceIndex: 0 }] },
      };
      localStorage.setItem("gymdraft", JSON.stringify(prior));
    }, original);
    await page.reload(); await page.locator("#login").waitFor();
    await page.evaluate(() => { document.getElementById("login").hidden = true; });
    await finish();
    assert.match(await page.locator("#cf-sheet").innerText(), /older draft has no saved source version/i);
    assert.deepEqual(await stored(), [original], "an unbound older draft must require a verified target");
    await page.locator('#cf-sheet [data-cf="0"]').click();
    const old = await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft")));
    await select(0);
    const preview = page.locator("#gen-body");
    const note = await preview.getByRole("row", { name: /Workout note/i }).innerText();
    assert.match(note, /Original workout note/); assert.match(note, /Updated before upgrade/);
    const memo = await preview.getByRole("row", { name: /Old press · Memo/i }).innerText();
    assert.match(memo, /Slow/); assert.match(memo, /Use bands/);
    const place = await preview.getByRole("row", { name: /Condo.*Gym/i }).innerText();
    assert.match(place, /Condo/);
    assert.match(await preview.innerText(), /tag="A"/);
    await preview.locator("[data-gen-close]").last().click();
    assert.deepEqual(await stored(), [original]);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft"))), old);
    await select(0);
    await page.locator("[data-resume-edit]").click();
    assert.deepEqual(await page.locator("#exs .mk-t b").allTextContents(), ["Old press", "Hold", "Old curl", "Strict press"]);
    await finish();
    assert.deepEqual(await stored(), [{ ...original, note: "Updated before upgrade", loc: "gym",
      names: { retired: "Old press", twins: "Hold", curl: "Old curl", press: "Strict press" }, memo: { retired: "Use bands" },
      ex: { retired: [{ kg: 5, reps: 6 }], twins: [{ kg: 0, reps: 5 }], curl: [{ kg: null, reps: 12 }],
        press: [{ kg: 7, reps: 10 }] },
    }]);
  }
  async function checkDraftSwitch(unverified) {
    await seed([legacy, record]); await open(0); await reps("chest-press", 14);
    if (unverified) {
      await page.evaluate(() => {
        const prior = JSON.parse(localStorage.getItem("gymdraft"));
        delete prior.historyVersion;
        localStorage.setItem("gymdraft", JSON.stringify(prior));
      });
      await page.reload(); await page.locator("#login").waitFor();
      await page.evaluate(() => { document.getElementById("login").hidden = true; });
    }
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft")));
    await select(1);
    const prompt = page.locator("#gen-body");
    assert.match(await prompt.innerText(), /Discard the open workout draft/i);
    assert.equal(await prompt.locator("[data-resume-edit]").count(), 0);
    await prompt.locator("[data-gen-close]").last().click();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("gymdraft"))), before);
    if (unverified) await page.locator("#tab-gym").click();
    else await open(0); // selecting the very same version resumes its edits
    assert.equal(await page.locator("#rp-chest-press-0").inputValue(), "14");
    await select(1); await prompt.locator("[data-fresh-edit]").click();
    await reps("lat-pulldown", 16); await finish();
    const edited = structuredClone(legacy); edited.ex["lat-pulldown"][0].reps = 16;
    assert.deepEqual(await stored(), [edited, record], "discard must affect only the open draft");
  }
  async function checkSetCount() {
    const entry = { ...record, names: { "chest-press": "Bench", "incline-db": "Incline" },
      memo: { "chest-press": "Slow" }, ex: {
        "chest-press": [{ kg: 5, reps: 6, tag: "A" }, { kg: 7, reps: 9, tag: "B" }],
        "incline-db": [{ kg: 4, reps: 8 }],
      },
    };
    await seed([entry]); await open(0);
    const count = async n => {
      await page.locator("#exs .pg-on .mk-more").click();
      await page.locator('[data-mk="edit"]').click();
      await page.locator("#es-chest-press").click();
      await page.locator(`#pad-chips [data-v="${n}"]`).click();
    };
    const rows = page.locator("#exs .pg-on input[data-pad=reps]");
    await count(1);
    await page.locator("#tx-bar [data-tx-cancel]").click();
    await page.locator("#tx-ask [data-drop]").click();
    assert.equal(await rows.count(), 2);
    await count(4); await page.locator("#tx-bar [data-tx-save]").click();
    assert.deepEqual(await rows.evaluateAll(inputs => inputs.map(el => el.value)), ["6", "9", "", ""]);
    await finish(); await page.locator('[data-cf="1"]').click();
    assert.deepEqual(await stored(), [entry], "increasing set count erased saved rows");
    await open(0); await count(1); await page.locator("#tx-bar [data-tx-save]").click();
    assert.equal(await rows.count(), 1);
    await finish();
    entry.ex["chest-press"].pop();
    assert.deepEqual(await stored(), [entry], "reducing set count should remove only trailing rows");
  }
  async function checkConflict(action, replace = false, oldDraft = false) {
    await seed([record]); await open(0); await reps("chest-press", 14);
    await page.locator("#tab-stats").click();
    const row = page.locator("#sessions details").first();
    await row.locator("summary").click();
    const moved = "2020-05-11";
    if (action === "move") await row.locator("[data-mv]").fill(moved);
    else {
      await row.locator("[data-rm]").click();
      await row.locator("[data-rm]").click();
    }
    const saved = action === "move" ? [{ ...record, date: moved }] : [];
    if (replace) {
      // Same program, date, saved timestamp and names, but a different workout.
      const other = structuredClone(record);
      other.ex["chest-press"][0].kg = 99;
      saved.push(other);
      await seed(saved);
    }
    await page.locator("#tab-gym").click();
    if (replace) {
      if (oldDraft) await page.evaluate(() => {
        const persisted = JSON.parse(localStorage.getItem("gymdraft"));
        delete persisted.historyVersion;
        delete persisted.historyDetached;
        delete persisted.historyExercises;
        for (const rows of Object.values(persisted.ex)) {
          for (const set of rows) delete set.sourceIndex;
        }
        localStorage.setItem("gymdraft", JSON.stringify(persisted));
      });
      await page.reload(); await page.locator("#login").waitFor();
      await page.evaluate(() => { document.getElementById("login").hidden = true; });
    }
    assert.equal(await page.evaluate(() => commitDraft(DAY,cur)), false);
    await finish();
    const conflict = page.locator("#cf-sheet");
    assert.match(await conflict.innerText(), oldDraft ? /no saved source version/i : /moved or deleted/i);
    await conflict.locator('[data-cf="0"]').click();
    if (oldDraft) await page.locator("#tab-gym").click();
    assert.equal(await page.locator("#rp-chest-press-0").inputValue(), "14");
    await finish(); await conflict.locator('[data-cf="1"]').click();
    await page.locator("#v-stats").waitFor();
    assert.equal(await page.evaluate(() => Boolean(draft.fromHist)), false);
    assert.deepEqual(await stored(), saved);
  }
  async function checkPersistedVersion() {
    await seed([record]); await open(0); await reps("chest-press", 12);
    // Simulate another tab writing a different version while this one has a
    // stale in-memory record, with no reload or changes to the open draft.
    const changed = { ...record, note: "Changed elsewhere" };
    await page.evaluate(log => localStorage.setItem("gymlog", JSON.stringify([log])), changed);
    await finish(); await page.locator('#cf-sheet [data-cf="0"]').click();
    assert.deepEqual(await stored(), [changed]);
    // A semantically identical source version and an unrelated new entry can
    // coexist. Saving the draft must preserve the new entry.
    const same = Object.fromEntries(Object.entries(record).reverse());
    await page.evaluate(items => localStorage.setItem("gymlog", JSON.stringify(items)), [legacy, same]);
    await finish();
    const edited = structuredClone(record); edited.ex["chest-press"][0].reps = 12;
    assert.deepEqual(await stored(), [legacy, edited]);
  }
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

    await checkLegacyDraft();
    await checkDraftSwitch(false);
    await checkDraftSwitch(true);
    await checkSetCount();
    await checkConflict("move");
    await checkConflict("delete");
    await checkConflict("move", true);
    await checkConflict("delete", true);
    await checkConflict("delete", true, true);
    await checkPersistedVersion();

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
