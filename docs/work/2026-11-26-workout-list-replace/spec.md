# spec
อ้างอิง mockup: แบบ A (mock5) + Replace flow (mock6) ขั้น 1, 2, 4 (ตัดขั้น 3 — เปลี่ยนแค่วันนี้)

## หน้า workout
- หัวรายการ: `N/M done` + แถบความคืบหน้า (แทน ‹ 1/9 › + จุด)
- ท่าที่กำลังเล่น (`.pg-on` = woIdx): การ์ดเต็มเหมือนเดิม + ปุ่ม `⇄ Replace` ข้าง ⋯
- ท่าอื่น: แถวเดียว `.wl-row`
  - เล่นครบแล้ว: `✓ ชื่อ` จาง + สรุป `12×8 ×3`
  - ยังไม่ครบ: ชื่อ · `⇄` · `N sets ›`
  - แตะแถว = goEx(i) (กางท่านั้น); แถวของท่าถัดไปมี class `ls-next` (ใช้แทนการ์ด Next เดิม)
- ไม่มี ⇄ บนท่าที่เล่นครบ และไม่มี Replace ตอนแก้ workout ย้อนหลัง (draft.fromHist)

## Replace
- sheet: ช่องค้นหา + ตัวกรอง Same muscle (default) / Same equipment / All; แสดงเฉพาะท่าที่ทำได้ในสถานที่ปัจจุบัน (canDo); ไม่แสดงท่าที่อยู่ใน session แล้ว
- เลือก → `draft.swap = {prog, map:{originalId: newExercise}}` (sets/reps เดิม), แถบ Undo
- `sessEx()` แทนท่าตาม map; บันทึก workout (`newWorkoutRecord`) ใช้ท่าใหม่ — ถ้าท่าเดิมติ๊กเซ็ตไปแล้ว เก็บทั้งสองท่าในบันทึก
- ป้ายใต้ชื่อ: `⇄ replaced <เดิม> · today only`

## ลบ
- ปุ่ม ⇄ ท่าคู่ (`data-alt`) และ handler ใน workout.js (ข้อมูล `alt` ในโปรแกรมเดิมไม่ลบ แค่ไม่ใช้)
