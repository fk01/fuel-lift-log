# Spec: เอาท่า ex101 ขึ้นระบบทั้งหมด
- `scripts/import-ex101.mjs` ship ทุกท่าใน ex101 (เดิมเฉพาะ id ใน `ex101-pick.json`).
- `scripts/ex101-pick.json` เหลือหน้าที่เดียว: map ex101 id → ชื่อท่าเดิมในแอป (`as`) เพื่อแปะ GIF ให้ท่าเดิม.
- UI ไม่เปลี่ยน: คลังโชว์สูงสุด 80 รายการ + "พิมพ์เพื่อค้นหาเพิ่ม" (มีอยู่แล้ว). catalog โหลด lazy.
- ขนาด: GIF ~127MB รวม, ไฟล์ใหญ่สุด ~230KB (ต่ำกว่า limit 25MiB/ไฟล์ของ Workers assets), 1324 ไฟล์ (ต่ำกว่า 20k).
- หมายเหตุ license: dataset ex101 ระบุ educational/non-commercial only.
