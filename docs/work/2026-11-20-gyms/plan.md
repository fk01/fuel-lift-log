# Plan: ยิมหลายที่

## โครงข้อมูล
- `PROGS` ยังเป็น object เดียว (sync/D1 เดิม) — แต่ละโปรแกรมมี `loc` (ไม่มี = "gym") และ `slot` (push/pull/push2/pull2 สำหรับตารางสัปดาห์; ไม่มี = key)
- `LOCS` (localStorage `locs`, sync ใน settings doc) · `curLoc` + `locday` (วันที่เลือกล่าสุด)
- log ใหม่มี `loc`; `logLoc(l)` = l.loc → loc ของโปรแกรม → "gym"
- server `docs.js`: เก็บ `locs` คู่กับ `progs` เมื่อ progsRev เก่ากว่า

## ไฟล์
1. `js/locations.js` (ใหม่ โหลดก่อน programs.js): LOCS, EQ (อุปกรณ์), EQ_DEF/SUB_DEF (อุปกรณ์+ท่าทดแทนค่าเริ่มต้น), eqOf/canDo/subFor/convertEx, slotKey/progsHere/logLoc, ensureLocs (migrate → สร้างคอนโด + แปลง Push/Pull A/B), หน้าเลือกสถานที่, ชีตแก้ไขสถานที่, ชีตคัดลอก/ย้ายโปรแกรม
2. `programs.js`: nextProg/renderProgs/renderToday ใช้ slotKey + กรองตามสถานที่, lastFor กรอง loc, ปุ่มสถานที่บนการ์ดวันนี้
3. `workout.js`: commitDraft บันทึก loc, ประวัติท่ากรอง loc, renderGym แสดงหน้าเลือกสถานที่
4. `program-manager.js`: รายการ/เพิ่ม/เรียง/ลบ เฉพาะสถานที่ปัจจุบัน + ปุ่ม ⇄ คัดลอก/ย้าย
5. `exercise-library.js`: กรองตามอุปกรณ์ + สวิตช์ "แสดงทั้งหมด"
6. `history-chart.js`, `stats-extra.js` (1RM เด่น): กรองตามสถานที่
7. `sync.js` locs, `index.html` section#locpick + script + bump ?v=, `app.css`
8. tests: step `gyms` — picker แสดง, เลือกคอนโด → โปรแกรมคอนโดเป็นท่าดัมเบล, เพิ่ม/แก้/ลบสถานที่, คัดลอกโปรแกรม
