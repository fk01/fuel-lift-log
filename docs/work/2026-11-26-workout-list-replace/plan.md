# plan
- [x] workout.js: sessEx + newWorkoutRecord รองรับ draft.swap; ลบปุ่ม/handler ท่าคู่ (data-alt)
- [x] public/js/workout-list.js: listify (หัว + แถบความคืบหน้า, แถวย่อ, .wl-next), ปุ่ม ⇄ Replace, sheet เลือกท่า, Undo
- [x] CSS ใน glass-cards.css v=59
- [x] index.html: script tag + bump ?v=
- [x] tests: .ls-next → .wl-next (history-edit, workout-blank-kg); เทสใหม่ tests/workout-replace.cjs (ผูกใน npm test)
- [x] npm test ผ่าน + screenshot

## หมายเหตุ
- Undo ถูกซ่อนทั้งแอปตามคำขอเดิม (app.css "Saved confirmation only") → เปิดเฉพาะหลัง Replace (`.undo-bar.with-undo`), แสดง 5 วินาที
- ท่าที่ติ๊กเซ็ตแล้วไม่มีปุ่ม ⇄ ในแถวย่อ (Replace ได้จากการ์ดตอนกาง) — ถ้าเปลี่ยน เซ็ตที่ติ๊กของท่าเดิมยังถูกบันทึก
