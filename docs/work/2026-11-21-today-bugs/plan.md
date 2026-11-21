# Plan: Today bugs (from device)
- Recovery times button dead: home.js bound listener at load, but #rec-cfg is after the scripts in index.html → delegate on document
- Body log button disappeared after logging today → always show ("บันทึกร่างกาย" / "แก้บันทึกวันนี้")
- smoke tests for both
- Meal chips skipped 0-kcal items (vitamins) → show every meal in the plan; chip = time + name (wraps, no ellipsis) so duplicates like "Vitamins after…" are distinguishable; smoke test home-all-meal-chips
- Body card: no fold; muscle map + tiles always shown; "ดูรายละเอียด ›" header link to Stats; [+ บันทึกร่างกาย][⚙ ตั้งเวลาฟื้นตัว] side by side (only place for both)
- Never-trained muscles show 100% (ready colour) in tiles/figure; legend drops "never"; summary counts them as ready
- "ดูรายละเอียด" toggles the muscle map (aria-expanded, › rotates, remembered per device in localStorage); smoke test home-details-toggle
