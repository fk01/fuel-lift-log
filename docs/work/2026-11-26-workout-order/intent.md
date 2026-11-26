# intent — workout: การ์ดท่าอยู่ล่างสุด, ของอื่นอยู่บน, ปุ่มเป็น glass
- ปัญหา: กด Add set แล้วการ์ดขยายลงจนดัน Next / Add exercise ลงไป
- ทำ: ลำดับ (flex order) Add exercise → pager ‹ › → Next → การ์ดท่า; ✓ และ − เป็น glass
- ไฟล์: workout-pager-fix.js (?v=2830), glass-cards.css (v=20)
