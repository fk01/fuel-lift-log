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
