# spec
ต้นเหตุที่เจอ
1. `public/js/workout.js` โหลดโค้ดหลักผ่าน jsDelivr (document.write) → CDN ช้า/ล่ม/ถูกบล็อก = `renderGym` ไม่มี หน้า gym พัง, เทสรันไม่ได้. แก้: inline โค้ดจาก commit 89ac7cb กลับ, โหลด pager-fix จาก index.html.
2. `pinAddExercise` ย้าย `#wo-add` เข้าใน `#exs` → `renderEx` ล้าง `#exs` ปุ่มหาย → render ถัดไป crash (`null.hidden`). แก้: วางปุ่มนอก `#exs` เสมอ.
3. `forceVisibleCard` ใส่ `pg-on` ทุกการ์ดแม้ไม่มี workout → แก้ให้ใส่เมื่อ `picked`.
4. Modal header (Exercise library / Manage programs) ดำสนิท `#000` ไม่เข้า panel → ใช้ `--panel-solid #1c1e22`.
5. Program sheet: แถวท่ามีคอลัมน์ว่าง 92px ทำให้ปุ่ม ▶ ไม่ชิดขวา; แถบ Start/Edit สี surface ต่างจาก panel → แก้ grid + สี.
6. เทส `workout-weight-controls` คาดว่า `#wo-add` ลอยล่าง (fixed) แต่ดีไซน์ปัจจุบันเป็น label inline → เช็ค clearance เฉพาะ element fixed/sticky.
