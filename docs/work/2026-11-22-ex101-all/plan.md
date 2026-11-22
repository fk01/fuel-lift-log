# Plan: เอาท่า ex101 ขึ้นระบบทั้งหมด
## ขั้นตอน
- [x] แก้ import script ให้วนทุกท่า, ใช้ pick เป็น map `as`
- [x] รัน script → rebuild `public/data/ex101.json` + `public/ex/*.gif`
- [x] bump `?v=`
## ไฟล์ที่แตะ
`scripts/import-ex101.mjs`, `scripts/ex101-pick.json`, `public/data/ex101.json`, `public/ex/`, `public/index.html`
## เทส
- [ ] `npm test`
- [ ] ภาพหน้าจอ: คลังท่า ค้นหาท่าใหม่

## รอบ 2: ตัวกรองแบบ chip (ตามภาพ user)
- [x] catalog เพิ่ม `b` (body_part)
- [x] ปุ่ม "⚙ ตัวกรอง" เปิด panel 3 หมวด: Category / Equipment / Target muscle, เลือกได้หมวดละ 1, แตะซ้ำ = ยกเลิก, มี "ล้างตัวกรอง"
- [x] ท่าใน EXLIB ที่มาจาก catalog ใช้ค่าจาก catalog (`catOf`) กรอง
- [x] `npm test` PASS, ภาพ `filters.png`
