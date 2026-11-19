# Plan: การฟื้นตัวแสดงกล้ามครบทุกมัด

## ขั้นตอน
- [x] `stats-extra.js` — `renderRecovery()` เขียนใหม่: `REC_ORDER` 16 มัดลำดับคงที่, 5 สถานะ (`NEGLECT=7` วัน), แถบ "ควรเล่น", กล่องรายละเอียดตอนแตะ, คำอธิบายสี 5 สี
- [x] `app.css` — `.rec-grid` 4 คอลัมน์, `.rec-due`, `.rec-det`, กรอบม่วงสำหรับละเลย/ยังไม่เคยเล่น
- [x] คำแปล EN: Never / Neglected / Due / Last exercises
- [x] bump `?v=` ใน `index.html`

## ไฟล์ที่แตะ
`public/js/stats-extra.js`, `public/css/app.css`, `public/index.html`

## เทส
- [x] `npm test` (smoke: ทุกแท็บ/หน้าต่างหลักไม่มี error)
- [x] เทสเฉพาะ: 16 ช่องเสมอ, การ์ดสูง ≤ 739 px, แตะ "ต้นขาหลัง" แล้วกล่องรายละเอียดขึ้น + หุ่นเหลือมัดเดียว, ไม่มีประวัติ → ทุกช่อง "ยังไม่เคยเล่น"
- [x] ภาพหน้าจอ: `mockup.png`
