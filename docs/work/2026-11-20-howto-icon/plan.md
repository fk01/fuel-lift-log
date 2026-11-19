# Plan: ซ่อนรูปท่า — เปิดผ่านไอคอน ▶ How to

## ขั้นตอน
- [x] `exercise-library.js` — `hasHow`, `howBtn(x,label)`, `openHowTo(id,name)` (แผ่นกลาง), ตัวดักคลิก `[data-how]` แบบ capture (ไม่เปิดแถวที่ครอบอยู่); `howTo()` คืนปุ่มแทนกล่องพับ; แถวคลังท่า + ชุด ex101 ใช้หุ่นเล็กแทน GIF
- [x] `programs.js` — แผ่นโปรแกรม: เอา GIF ออก, เพิ่ม ▶
- [x] `workout.js` — การ์ดท่า: เอา GIF + กล่องพับออก, ▶ หน้าชื่อ
- [x] `stats-extra.js` — 1RM เด่น / แผ่นกล้ามเนื้อ: หุ่นเล็ก + ▶
- [x] `app.css` — `.how-btn`, `.how-gif`, `.how-steps`
- [x] bump `?v=`

## เทส
- [x] `npm test` + ขั้นใหม่ `no-inline-gif` (แผ่นโปรแกรม/คลังท่าไม่มี `img[src$=".gif"]`) และ `howto` (เปิดแผ่นวิธีเล่นแล้วมี GIF)
- [x] ภาพ: mockup-*.png
