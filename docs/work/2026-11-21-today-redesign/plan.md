# Plan: Today redesign (user ข้าม OK spec)
1. `home.js renderHome`: order = workout → food → body (details, collapsed)
2. workout: primary program only (+N more), suggestion only when nothing planned, primary "เริ่ม <prog>" button
3. food: inline "กินมื้อนี้แล้ว" tick → `food[TODAY].done`
4. body: summary line (ready x/16, recovering muscles) or beginner empty text; full map + recovery-times button inside the fold
5. P3: body icon, "ดูแผน" → "View meals", drop dead `trainLinks()`, drop disabled-button card
6. CSS block at end of app.css; bump `?v=`; `npm test`; before/after screenshots

## Round 2 (critique v2 25/40)
- P0 warn when planned program hits recovering muscles + "เริ่ม <rested> แทน" button
- P1 meal tick → undoLoud (Undo bar); kcal/protein/sets progress bars + mono numerals
- P2 Start button calls startPlanItem directly; skip 0-kcal items as "next meal"; flat empty body card

## Round 3 (critique v3 25/40)
- recovering: rested program becomes primary, planned one secondary ("เล่นตามแผน")
- rest day: secondary "ออกกำลังอยู่ดี"
- meal tick: inline "✓ <meal> · ยกเลิก" chip (global Undo button stays off per #88)
- bar turns amber when >110% of target

## Body weight on Today
- body card: latest kg (mono) + change vs ~7 days ago (neutral colour, no goal assumed) + "ชั่งวันนี้" when today not logged → number pad → BODY
- show all three body values (kg, muscle mass, fat %) each with 7-day change; "ชั่งวันนี้" in the card header
- "ชั่งวันนี้" opens the Stats body-log sheet (kg / muscle / fat) via exposed `openBodyLog`; saving refreshes Today

## Round 4 (critique v4 26/40)
- headline follows the primary action when a rested swap is suggested ("Pull A · แนะนำวันนี้")
- meal cancel sits in the header link slot (no extra row) → returning state + tick fits above tab bar
- weigh-in sheet opens blank from Today (no stale prefill), steppers start at last value
- warning bigger/bolder; Weigh in target 44px; Start 48px

## Round 5
- meal chips (tick/untick any meal, out of order; replaces next-meal button + cancel link)
- clearer counters: "ทำเสร็จ X จาก N รายการวันนี้", "+ <program names>", "พร้อม X จาก 16 กลุ่มกล้าม"
- body summary drops the recovering list when the workout card already warns

## Round 6 (critique v6 33/40)
- disambiguate duplicate plan names with place; program preview (N ท่า · muscles)
- warning replaces progress subline; bar hidden at 0
- meal chips wrap (no hidden meals), short labels + full aria-label
- body: explicit "ดูแผนที่กล้าม ▾" row instead of chevron; deltas carry units; "เกินเป้า" text label
- weigh sheet placeholder = last value

## Round 7 (critique v7 32/40; B rate-limited, detector run in parent)
- same program at two places = one plan item; counts by distinct program
- protein over target is not a warning (kcal only); "เกินเป้า" nowrap
- body summary: "พร้อมเล่น X · กำลังฟื้น Y กลุ่มกล้าม"
- "เล่นตามแผน" is a text link; meal chips 3-col grid; food/body cards flatter than the main card

## Round 8 (critique v8 32/40)
- body summary splits ready / recovering / not trained yet
- zero-state: no "Done 0 of N", no "–" stats (one hint line), no rest-day duplicate
- weigh placeholders read "ล่าสุด 70.4"; ticked chip = colour only (no truncation)
- Start errors toast; muscle-map hint "100% = rested"; Escape/backdrop close sheets; dead CSS removed

## Round 9 (critique v9 32/40)
- body summary count-first ("0 ready · 8 recovering · 8 not trained yet")
- ticked chip shows ✓; warning replaces the preview line; "Stick to plan" more legible
- train card gets a "Plan ›" header link; "+ Log body" reads as an action; weigh failure toasts

## Round 10 (critique v10 30/40 — found 2 real bugs)
- P0 done state: finished workout shows "✓ เสร็จแล้ววันนี้ <program>" + "ดูบันทึกวันนี้ ›", no Start/swap; next undone program leads when partially done
- P1 0-kcal items (vitamins) never block "ครบทุกมื้อแล้ว"
- swap reason in headline ("Pull A · แทน Push B"); readiness drops zero counts and the duplicate recovering list
- chip ✓ inline without truncation; smoke test home-done-states

## Round 11 (critique v11 32/40)
- one lift session a day: once any weights program is logged, other planned lifts count as skipped (taken swap = done); cardio still counts on its own
- "+ others" lists only remaining undone items; "never trained" wording
- "เล่นตามแผน" underlined (reads as a button); ticked chips no longer truncate
- "ออกกำลังอยู่ดี" switches day mode to train; weigh sheet moves focus inside
- smoke test home-swap-counts-as-done

## Round 12 (critique v12 32/40)
- done headline lists only programs actually logged; subline shows "ข้าม N" for skipped lifts
- next meal more than 2 h overdue reads "ยังไม่ติ๊ก <time> <meal>"
- body: drops "never trained" once there is history; adds "กลุ่มแรกพร้อมใน ~N ชม."
- "+ บันทึกร่างกาย" is an outlined pill (action, not nav); sheet focuses the first input and returns focus to the trigger

## Critique v13 (32/40) — user picked 4 fixes
- muscle tile names wrap (no "Front d…"), app-wide
- "<muscle> พร้อมใน ~N ชม." instead of "กลุ่มแรกพร้อมใน"
- meal chips: fixed 3 cols, last row stretches (no orphan)
- body-fat delta in "จุด"/pts; legend "เพิ่งเล่น (<40%)"

## Critique v15 (32/40) — user picked all 4 groups
- Why: green "<muscles> พักพอแล้ว → เหมาะกับวันนี้" leads; recovering warning is secondary
- Where: suggested program shows its own place picker; cardio shows no place tag
- multi-item: first undone lift is the primary Start; Start buttons same pill shape
- polish: muscle names hyphenate instead of mid-word breaks; next-meal chip glows (DESIGN: glow = next); 0-kcal chips smaller; done state shows "ต่อไป: โปรตีนเหลือ N g"
