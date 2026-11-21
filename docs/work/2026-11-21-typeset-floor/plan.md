# Plan: ฟอนต์ไม่ต่ำกว่า 12px
1. เพิ่ม `--t-label:.75rem;--t-meta:.8125rem` ใน `:root` (app.css บรรทัด 2)
2. sed: `font-size:.55|.6|.62|.65|.66|.68|.7|.72|.74|.75rem` → `var(--t-label)`, `.78rem` → `var(--t-meta)`
3. screenshot 375px ก่อน/หลัง (วันนี้/กิน/ออกกำลัง/สถิติ) + นับ element ล้น; แก้จุดล้น
4. bump `?v=` ใน index.html, `npm test`
