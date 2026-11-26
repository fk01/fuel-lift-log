# spec
สูตรเดียว: `--glass-bg` gradient + blur(16px) + border rgba(255,255,255,.18) + shadow. ไฟล์ใหม่ `public/css/glass-cards.css` (โหลดท้ายสุดผ่าน data-io.js).
- เปลี่ยน: `#v-home .hq-card/.hq-chal`, `#v-gym .ex`, `.mk-pill`, `.modal-in/.sheet-in/.drawer-in/.pad-in`, sticky header + แถบ Start ใน sheet
- หน้า Food/Stats/More/Gym list เป็น glass อยู่แล้ว (audit สี background ด้วย playwright)

## แก้รอบ 2
blur(16px) ทำให้ภาพพื้นหลังเบลอไม่ทะลุ (การ์ด Start บน Today ไม่มี blur) → เอา backdrop-filter ออกจากกล่องทุกหน้า (glass-cards.css v=5).
