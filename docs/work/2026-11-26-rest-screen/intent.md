# intent — หน้าพัก (rest timer) ใหม่
- ผู้ใช้เลือก: ท่ามีรูปสาธิต → แบบ B, ไม่มีรูป → แบบ A
- B: รูปท่าถัดไปเต็มจอบนพื้นดำ, ล่าง: "Next · ท่า · Set N", เวลาใหญ่, แถบความคืบหน้า, −15s · +15s · Skip ›
- A: วงนับถอยหลังใหญ่ (ขาว) + "of 2:00", −15s · +15s · Skip ›, บรรทัด Next · ท่า · Set N · น้ำหนัก
- ปุ่มทั้งหมดเป็น label เปล่า; ซ่อนปุ่มเดิม (สี่เหลี่ยมขาว, วงกลม ±15s, การ์ด Next, ภาพคนนั่งพัก)
- Skip = จบพัก; −/+ ใช้ handler เดิม (#rest-minus/#rest-plus)
- ไฟล์: public/js/rest-ui.js (ใหม่, wrap startRest), glass-cards.css v=70, index.html

## รอบ 2
ผู้ใช้: สีดำยังบังพื้นหลัง → เลิกพื้นดำเรียบ; ภาพการ์ตูน (#rest::before) คลุมเต็มจอ; รูปท่า mix-blend screen (ดำ = โปร่ง), .rest-in z-index:auto ไม่แยกชั้น; gradient ล่างจางลง (glass-cards.css v=72)
