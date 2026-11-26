# Plan — "Discard changes?" (#tx-ask) เข้าธีม
Device: กล่องกลางจอโปร่ง ตัวหนังสือหน้าหลังทะลุซ้อน อ่านไม่ออก, "Discard" สีแดง.
- เปลี่ยนเป็น bottom sheet glass + blur 24px (หลังไม่ทะลุ), overlay มืด + blur.
- ปุ่ม: Keep editing (ซ้าย, เทา) | Discard (ขวา, ขาวหนา) label เปล่า เส้นบางด้านบน — แบบเดียวกับ Cancel | Save.
- CSS only, glass-cards.css v=96. `npm test` + screenshot.
