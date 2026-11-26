# intent — ทุก modal ที่มี Save ต้องมี Cancel คู่
- กฎ: sheet ที่มีปุ่มบันทึก → แถบล่างเดียวกันเสมอ: `Cancel` ซ้าย, `✓ Save` ขวา, เส้นคั่นบน
- ทำ: `public/js/sheet-pair.js` ครอบ openGen() — หลังเปิด sheet
  - ถ้าปุ่ม primary แบบบันทึก (บันทึก/เซฟ/สร้าง/Save/Create/Apply/ใช้ที่นี่) ยังไม่อยู่ใน `.sheet-act` → สร้างแถบ + Cancel (`data-gen-close` = ทางปิดเดิม รวม txLeave)
  - ถ้ามี `.sheet-act` แล้วแต่ไม่มี Cancel → เติม Cancel ซ้าย
  - ซ่อนปุ่ม Close/Cancel เดี่ยวเดิมที่ซ้ำ, ใส่ ✓ หน้า Save ถ้ายังไม่มี
- แถบไม่ตัดตัวอักษรชิดขอบ (glass-cards.css v=50)
- ไม่ครอบคลุม: modal ที่ไม่ใช่ openGen (run-modal, share-modal, pm-modal)

## แก้ระหว่างทาง
เทส history-edit พัง: ซ่อนปุ่ม Cancel เดิมที่มี data-gen-close → เปลี่ยนเป็นย้ายปุ่ม Cancel/Close เดิมเข้าแถบ (เก็บ handler เดิม), ซ่อนเฉพาะปุ่มซ้ำที่ไม่มี data-gen-close
