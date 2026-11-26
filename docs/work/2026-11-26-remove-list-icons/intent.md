# intent — เอา icon tile ในแถวลิสต์ออก
- ปัญหา: tile ดำ/icon ในแถว (Today cardio, Food meals, Train programs, workout card) แย่งสายตาจากภาพ bg
- ทำ: ซ่อนด้วย `glass-cards.css` (v=8): `.hq-th .dm-ic .row-ic .pa-ic .ls-th` ในหน้า Today/Food/Train; modal ยังมี icon เดิม
- สำเร็จเมื่อ: แถวไม่มี tile, ภาพ bg เด่นขึ้น, `npm test` ผ่าน
