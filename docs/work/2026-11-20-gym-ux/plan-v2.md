# Plan v2
- locations.js: `types` แทน `act`; ensureV3 (types, `days` ทุกโปรแกรมจาก WEEK เดิม, วิ่ง/ตีแบด → โปรแกรมคาร์ดิโอ tag run/bad); planKeys/planFor จาก days; cxGet/cxSet (run/bad ใช้ tags เดิม, อื่น ๆ tags.cx); openAddProg, openCardioEdit, ชิปวัน
- programs.js: การ์ดคาร์ดิโอจากโปรแกรม, การ์ดวันนี้ไม่มีข้อความทำไม่ได้ → ชิปโปรแกรมของที่นี่, modal ตีแบดเป็น "✓ ทำแล้ว" ทั่วไป
- run.js: modal วิ่งใช้กับโปรแกรมแบบระยะ+เวลาทุกตัว
- program-manager.js: ชิปวันในตาราง, JSON เฉพาะเวทของที่นี่ (merge กลับ), แถวคาร์ดิโอเปิดตัวแก้ของมัน
- ต่างจาก spec: บันทึกคาร์ดิโอเก็บใน food tags (ไม่ใช่ log ใหม่) เพื่อให้มื้อเสริมหลังวิ่ง/วันแบด, ประวัติ, XP เดิมทำงานต่อ
