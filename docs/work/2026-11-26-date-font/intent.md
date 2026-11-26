# intent — วันที่บนหัวหน้า Train เล็กกว่าหน้าอื่น
- ต้นเหตุ: app.css `#week small{font-size:var(--t-label)}` (12px) โดน `.hq-hi small` ของหน้า Train
- แก้: `.hq-hello .hq-hi small` = 14px ทุกหน้า (glass-cards.css v=89); วัดแล้ว Today/Eat/Train/Stats เท่ากัน
