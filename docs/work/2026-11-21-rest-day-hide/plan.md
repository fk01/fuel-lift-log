# Fix: วันพักไม่ต้องโชว์แผน
กด "พักวันนี้" แล้ว ซ่อน What today? / รายการ / + Add to today / crumb "today › Rest" ใต้การ์ดพัก.
CSS: `#locpick .rest-card~*,#v-gym.resting #lochead{display:none}`. กด "Changed my mind — train" การ์ดพักหาย ทุกอย่างกลับมา (smoke test ครอบ).
