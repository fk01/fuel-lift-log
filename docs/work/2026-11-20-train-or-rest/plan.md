# Plan
- locations.js: dayMode (daymode ใน localStorage ต่อวัน), needDay/resting/needPick, renderDayPick (ออก/พัก + แนะนำ + บรรทัดรอง), chooseDay; หน้าเลือกสถานที่หัว "ไปที่ไหน?" + ‹ กลับ (คืนที่เดิม หรือกลับขั้นออก/พัก)
- programs.js: การ์ดวันนี้โหมดพัก (3 มัดฟื้นน้อยสุด + เปลี่ยนใจ), "เลือกโปรแกรม" เมื่อเลือกออกในวันไม่มีแผน, ลิงก์ "พักแทน"
- css: .dp-card, ซ่อนโปรแกรม/หัวสถานที่ตอนพัก
- tests: day-pick, gyms-restday ปรับ
