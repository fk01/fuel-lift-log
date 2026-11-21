# Plan
1. ลบ `.btn.sm{min-height:36px}` (บรรทัด 453) และ min-height ใน 790
2. เพิ่มบล็อก "Touch floor" ท้าย app.css ตาม spec; checkbox `.sets` = 28px (input ห่อ label ไม่ได้ในโครง grid เดิม)
3. วัดด้วยสคริปต์ 375px + screenshot, แก้จุดล้น
4. bump `?v=`, `npm test`
