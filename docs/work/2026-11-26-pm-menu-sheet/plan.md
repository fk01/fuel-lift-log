# Plan — program editor ⋯ menu + Delete confirm
Device screenshots: sheet ลอย มีแถบดำใต้ sheet (padding เผื่อ tx-bar), tx-bar ทึบ, เมนูมี icon ↑ ⇄ 🗑.
- edit-tx.js: body.tx-gen เมื่อ editor บนสุดคือ gen sheet.
- CSS: sheet เมนู/confirm ที่เปิดทับ editor → ซ่อน tx-bar + padding-bottom 0 (sheet ชิดล่าง).
- เมนู ⋯ (`.pm-acts`) ตัด icon.
- tx-bar: glass blur แทนพื้นทึบ, จุด Unsaved สีเทา.
- glass-cards v=97, edit-tx v=138714, program-manager v=138725. `npm test` + screenshot.
