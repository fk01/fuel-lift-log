# Spec: glow เฉพาะของที่ live

## หน้าจอ / พฤติกรรม
| ตัว | ตอนนี้ (app.css) | ใหม่ |
|---|---|---|
| `.tabbar` (973) | glow cyan 18px + เงาดำ | เงาดำ `0 8px 24px #0008` อย่างเดียว |
| `.today` (612) | `var(--glow)` ตลอด | ไม่มี glow; ใส่เฉพาะ `.today.live` = ยังมีงานวันนี้ไม่เสร็จ (class ตั้งใน `renderToday()`) |
| `.acct-logo` (1033) | gradient text | `color:var(--fg)` ทึบ |
| `.wd.sel` (221) | `outline:1px solid var(--line)` กลบ focus | ย้ายเส้นไปเป็น `box-shadow:inset 0 0 0 1px var(--line)`; outline คืนให้ `:focus-visible` |

ไม่แตะ: `.btn.primary`, `.pc-go`, chip/tab ที่ถูกเลือก, `.pl-row.nx`, `.prog[aria-pressed]`, `.crumbs .cr.cur`.

## ข้อมูล
ไม่เกี่ยว.

## ข้อความ
ไม่เปลี่ยน.

## กรณีพิเศษ
- วันพัก / ทำครบแล้ว → `.today` ไม่ glow.
- ถ้าเงื่อนไข "งานค้าง" หาใน `renderToday()` ไม่เจอชัด: ใช้ glow เฉพาะเมื่อมีปุ่ม Start/ต่อ อยู่ในการ์ด.

## ภาพ mockup
ไม่มี. screenshot ก่อน/หลัง: วันนี้, ออกกำลัง, login.
