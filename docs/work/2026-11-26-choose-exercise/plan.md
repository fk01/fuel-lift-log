# Plan — Choose exercise (Add exercise) หลุดธีม
Device screenshot: "+ Create exercise" กรอบประ, ช่อง search มีกรอบ, หัว sticky ทึบ.
- app.css `#lib-modal.adding #lib-new` (dashed) ชนะ rule glass → เพิ่ม `#lib-modal.adding #lib-new` border 0.
- `#lib-q` type=search: iOS appearance วาดกรอบ → appearance none.
- หัว sticky pm/lib: glass-cards บรรทัดเดิม .96 → .28 + `:first-child` ให้ชนะ.
- glass-cards.css v=93. `npm test`.
