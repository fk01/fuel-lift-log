# Plan: Today bugs (from device)
- Recovery times button dead: home.js bound listener at load, but #rec-cfg is after the scripts in index.html → delegate on document
- Body log button disappeared after logging today → always show ("บันทึกร่างกาย" / "แก้บันทึกวันนี้")
- smoke tests for both
- Meal chips skipped 0-kcal items (vitamins) → show every meal in the plan; chip = time + name (wraps, no ellipsis) so duplicates like "Vitamins after…" are distinguishable; smoke test home-all-meal-chips
- Body card: no fold; muscle map + tiles always shown; "ดูรายละเอียด ›" header link to Stats; [+ บันทึกร่างกาย][⚙ ตั้งเวลาฟื้นตัว] side by side (only place for both)
- Never-trained muscles show 100% (ready colour) in tiles/figure; legend drops "never"; summary counts them as ready
- "ดูรายละเอียด" toggles the muscle map (aria-expanded, › rotates, remembered per device in localStorage); smoke test home-details-toggle
- [+ บันทึกร่างกาย][⚙ ตั้งเวลาฟื้นตัว] move inside the Details fold with the muscle map

## Critique v14 (32/40) — user picked 4 fixes + 1 request
- preview "N ท่า · muscles" shows even when muscles are recovering
- fresh body copy is a button that opens the log sheet; recovery-times sheet takes focus
- single-item done state: no repeated "1 of 1" line/bar
- ticked chips wrap full names; header links "ดูแผน ›" / "ดูแผน ›" / "ดูรายละเอียด ›" (EN: View plan / View meals / View details)
- request: plan with several items → Today lists every item with its own Start (first undone = primary); smoke test home-lists-every-plan-item

## Where on Today (user picked option 1)
- every item shows its place (same chip as Train); a program planned at several places shows place chips, the chosen one decides what Start opens; smoke test home-where-pick

## Hotfix: Today crashed with an empty plan / rest day
- #125 pick()/sib() read PROGS[undefined].name when nothing is planned → guard; smoke test home-empty-plan-and-rest

## Train: remove Share button (user request)
- app.js keeps #share-last hidden on every tab (listener/share-card code untouched)

## Eat: Share meal plan / Manage plan buttons touched
- .mp-open-row gap 8px (+ wrap)

## Fix: suggested program showed two places
- #129 listed every library program with the same name (Pull A @Gym + @Condo) → a suggested program now shows only its own place; picker stays only for one program planned at several places; smoke test home-swap-single-place

## Fix: place shown twice / inconsistent rows
- #130 left a // comment that swallowed the rest of where() on the same line
- Today now mirrors Train: one row per plan item (Push B @Gym and Push B @Condo = two rows), one place each on its own line; place picker removed; never suggest a program already in the plan; a planned lift with rested muscles leads
- smoke test home-one-row-per-plan-item (replaces home-where-pick)

## Start buttons: same shape and size on every row
- .hq-ps / .hq-ps.primary: 96x44, radius 12 (primary keeps the gradient colour only)

## Lead row first
- the suggested item (primary Start) is always the first row; done items sink to the bottom
- lead = planned lift with the fewest recovering muscles (every lift had one tired muscle, so "none tired" never matched)
- smoke test home-lead-row-first

## Today gets the shared week calendar (user request)
- same calCard as Eat/Train; picking a day sets DAY → all three tabs follow
- Today reads the picked day (food/logs/body log), past days say "เสร็จแล้ว" / "ดูบันทึก" instead of "วันนี้"
- smoke test home-calendar-links-tabs

## Items 1–4 from "what to add"
1. other day: title shows the date + "กลับวันนี้" in the calendar; training card shows what was done that day (no Start/suggestion); food card "ติ๊กแล้ว X/Y มื้อ"
2. streak under the calendar: trained days this week · ate to goal X/Y · Lv + tier (hero XP)
3. tap the "N ท่า · muscles ›" line → sheet listing exercises (sets × reps · muscles) with Start; empty plan → one-tap Start of the suggestion; EN muscle names in plain words (Front shoulders, Upper back, Front/Back thighs…)
4. meal chips: next + ticked shown, rest behind "+N มื้ออื่น"; "+ กินอย่างอื่น" opens the food log

## Today calm layout (try-out, Today only — from reference shots)
- greeting header (avatar initial, date, "สวัสดี, <name>") replaces the "Today" title on Today
- round week strip: ✓ trained / × missed / ring = meals ticked; tap = same DAY link; ‹ › week
- segment "แผนวันนี้ | สัปดาห์นี้": week = 4 stat tiles + kcal-per-day bars
- flat cards (no border/glow), every plan item as a card row with a muscle thumbnail + "เวท · ~N นาที" chip
- other tabs untouched (header/grid restored when leaving Today)

## Critique v16 (29/40) — user picked 4 groups
- week strip: missed/rest days = faint dot (no ×); today ring shows % of meals ticked
- training card meta = "N ท่า · ~N นาที" (muscles in the preview sheet); one muted readiness line
- single layer: training section is a label + item cards; week tab tiles flat
- one Start (lead card); other cards tap → program sheet
- week tab: weight tile "−0.8 kg · ใน 7 วัน"; empty kcal chart → hint text; week arrows + Thai preview button 44px
