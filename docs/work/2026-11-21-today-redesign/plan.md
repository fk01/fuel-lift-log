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
