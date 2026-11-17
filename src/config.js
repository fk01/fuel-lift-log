// Shared constants

export const TZ_HOURS = 7; // Asia/Bangkok
export const COOKIE = "fl_auth";

// มื้อและวิตามินที่จะเตือน (ตรงกับ MEALS ใน public/js/food.js)
export const REMINDERS = [
  { id: "m1", time: "08:00", title: "🍳 มื้อเช้า", body: "Iso Soy 2 + Mass 2 สกู๊ป · กล้วย 2 ลูก" },
  { id: "v1", time: "08:15", title: "💊 วิตามินหลังมื้อเช้า", body: "อย่าลืมวิตามินชุดเช้า" },
  { id: "m2", time: "12:30", title: "🍚 มื้อกลางวัน", body: "ข้าวกล้อง 150 g · เนื้อวัว 100 g · ไข่ 1 · ผัก" },
  { id: "m3", time: "15:00", title: "🥤 มื้อบ่าย", body: "Iso Soy 2 + Mass 2 สกู๊ป · ถั่ว 1 กำมือ" },
  { id: "m4", time: "19:00", late: "18:00", title: "🍽️ มื้อเย็น (มื้อสุดท้าย)", body: "ข้าวกล้อง 150 g · ปลา/อกไก่ 100 g · ไข่ 1 · ผัก" },
  { id: "v2", time: "19:15", late: "18:15", title: "💊 วิตามินหลังมื้อเย็น", body: "อย่าลืมวิตามินชุดเย็น" },
];
