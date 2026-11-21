# Fix: กด Start cardio แล้วปิด → หน้าค้าง
**สาเหตุ:** `startPlanItem()` (locations.js) สำหรับ cardio ตั้ง day mode = train + locDay ก่อนเปิด modal → `renderGym()` ซ่อนหน้าแผน (#locpick) โชว์รายการโปรแกรมเก่า (#step1) ที่ปุ่ม Start/… ไม่ทำงาน. ปิด modal แล้วค้างหน้านั้น.
**แก้:** cardio + go → `openCardio(k)` ทันที ไม่เปลี่ยน day mode. เซฟยังทำงาน (แถวขึ้น Done).
**Test:** smoke step `cardio-close-stays` — fail ก่อนแก้, ผ่านหลังแก้.
