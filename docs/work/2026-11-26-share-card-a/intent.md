# intent — หน้าแชร์ผล แบบ A (ผู้ใช้เลือกจาก mockup A–D)
- การ์ด Run: ภาพการ์ตูนของแอปเป็นพื้นหลัง (หรือรูปที่เลือกเอง), ล่างซ้าย: "RUN 10 KM · 26 NOV 2026", ระยะตัวใหญ่, PACE · TIME, WEIGHTGRAM ขาว (ตัด WEIGHTGRAM ส้ม + ตัวการ์ตูนพิกเซล)
- รูปแบบเป็น label: Story 9:16 · Square (ใหม่ 1080×1080) · Transparent; workout card มี Card · Story 9:16
- แถบล่าง Close | ↓ Save image (ไม่มีปุ่มขาวทึบ)
- ไฟล์: public/js/share-ui.js (ใหม่: drawRun ใหม่ + chrome), glass-cards.css v=77
- ยังไม่ทำ: การ์ดแชร์ workout เวท (drawCard) ยังเป็นดีไซน์เดิม

## รอบ 2 — การ์ดเวท แบบ A2 (ผู้ใช้ตอบ "แบบ B" = ตัวเลือกที่ 2)
- drawCard ใหม่ 1080×1920: ภาพการ์ตูน, ชื่อโปรแกรม · วันที่, volume ใหญ่ (kg), SETS · TIME (ถ้าไม่มี dur ใช้จำนวนท่า), รายการท่า + เซ็ตหนักสุด (สูงสุด 6 ท่า + "+n more"), WEIGHTGRAM ขาว
- การ์ดเป็น 9:16 แล้ว → ซ่อนแถวเลือกรูปแบบสำหรับ workout
