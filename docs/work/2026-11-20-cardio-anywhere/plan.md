# Plan
- locations.js: ensureV4 (คาร์ดิโอ loc="*", รวมชื่อซ้ำ, lastLoc), progsHere รวมคาร์ดิโอ, cxGet/cxTxt มีสถานที่, cardioWhere (ชิปที่ไหน + ที่ใหม่) ในแผ่นบันทึกวิ่ง/✓, แผ่นเพิ่มเข้าวันนี้ มีแท็บ เวท|คาร์ดิโอ, openCreateProg ฟอร์มเดียว สร้างเมื่อกดเท่านั้น
- programs.js openCardio เรียก cardioWhere; app/sync เรียก ensureV4
- tests: cardio-anywhere
