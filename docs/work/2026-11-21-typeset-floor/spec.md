# Spec: ฟอนต์ไม่ต่ำกว่า 12px

## หน้าจอ / พฤติกรรม
เพิ่ม token ใน `:root` ของ `public/css/app.css`:
- `--t-label: .75rem` (12px) — chip, tab label, caption, ตัวเลขรอง
- `--t-meta: .8125rem` (13px) — ข้อความรองที่อ่านเป็นประโยค

Mapping (ทั้งไฟล์, 102 จุด):

| เดิม | px เดิม | ใหม่ | จำนวน |
|---|---|---|---|
| .55 / .6 / .62 / .65 / .66 / .68 / .7 / .72 / .74 / .75rem | 8.8–12 | `var(--t-label)` | 88 |
| .78rem | 12.5 | `var(--t-meta)` | 14 |

≥ .8rem ไม่แตะ. ไม่เปลี่ยน weight/family/สี.
จุดที่โตขึ้นมาก (.55–.62rem ในกราฟ/ตาราง/badge) ถ้าล้น: ลด padding/letter-spacing, ใช้ `white-space:nowrap` + ellipsis, ห้ามลดฟอนต์กลับ.

## ข้อมูล (localStorage / D1 / sync)
ไม่เกี่ยว.

## ข้อความ (TH / EN)
ไม่เปลี่ยน.

## กรณีพิเศษ
- iPhone SE (320/375px): chip row, ตาราง `.btab`, badge บน muscle map, rest bar.
- ตัวอักษรไทยมีวรรณยุกต์ซ้อน: line-height ของ label ≥ 1.3.

## ภาพ mockup
ไม่มี mockup แยก (เปลี่ยนแค่ขนาด). ส่ง screenshot ก่อน/หลัง 375px ตอนขั้น 4: วันนี้, กิน, ออกกำลัง, สถิติ.
