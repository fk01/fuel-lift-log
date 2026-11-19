# Plan: แตะมัดกล้าม → แผ่นเลื่อนขึ้น

## ขั้นตอน
- [x] `stats-extra.js` — ช่องมัดเรียก `openMuscle(m)`; เอากล่องรายละเอียดแทรกและการ isolate หุ่นในการ์ดออก
- [x] `openMuscle(m)` — สถานะ, หุ่น 220 px ระบายมัดเดียว, ท่าที่เล่นล่าสุด (≤6, หลัก/รอง), ท่าในโปรแกรม (รวมชื่อโปรแกรม), หน้าว่างเมื่อไม่มี
- [x] `app.css` — `.msh-*`, ป้าย `.mrole`
- [x] คำแปล EN
- [x] bump `?v=`

## ไฟล์ที่แตะ
`public/js/stats-extra.js`, `public/css/app.css`, `public/index.html`, `tests/smoke.cjs`

## เทส
- [x] `npm test` + ขั้นใหม่ `muscle-sheet` (เปิดแผ่นของมัดที่ไม่เคยเล่น ต้องมีหัวข้อ "ท่าที่ช่วยมัดนี้ในโปรแกรม")
- [x] ภาพ: `mockup-chest.png`, `mockup-hamstrings.png`
