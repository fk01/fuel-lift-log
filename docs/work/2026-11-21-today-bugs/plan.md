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

## Today as 4W1H (user request; Who = login, skipped)
- brief card on top: ทำไม (goal from profile + 7-day trend of the goal metric, tap → profile) · อะไร (today items + meal count) · ที่ไหน (places of today items)
- cards below are the How: "ออกกำลังยังไง" / "กินยังไง" / "ร่างกายเป็นยังไง"; multi-item list has no repeated count headline
