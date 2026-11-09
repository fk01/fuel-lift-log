# Fuel & Lift Log

เช็กลิสต์อาหาร + บันทึกเวท + แจ้งเตือนมื้ออาหาร บน Cloudflare Workers (Static Assets + D1 + Cron + Web Push)

## โครงสร้าง
```
public/           หน้าเว็บ (index.html, sw.js, manifest, icons)
src/worker.js     API, ล็อกอิน PIN, cron แจ้งเตือน, Web Push
scripts/gen-vapid.mjs   สร้างคีย์ VAPID
wrangler.jsonc    ค่าตั้ง Worker
```

## ติดตั้งครั้งแรก

### 1. สร้างฐานข้อมูล D1
Cloudflare Dashboard → **Storage & Databases → D1 → Create** ตั้งชื่อ `fuel-lift-log`
คัดลอก **Database ID** มาแทน `REPLACE_WITH_YOUR_D1_DATABASE_ID` ใน `wrangler.jsonc`
(ตารางจะถูกสร้างอัตโนมัติตอนเรียก API ครั้งแรก ไม่ต้องรัน SQL เอง)

### 2. สร้างคีย์แจ้งเตือน (VAPID)
```bash
node scripts/gen-vapid.mjs
```
จะได้ 2 บรรทัด `VAPID_PUBLIC_KEY=...` และ `VAPID_PRIVATE_JWK=...` เก็บไว้ใช้ในข้อ 4

### 3. Deploy จาก GitHub
Push โฟลเดอร์นี้ขึ้น GitHub แล้วไปที่ **Workers & Pages → Create → Import a repository**
- Build command: (เว้นว่าง)
- Deploy command: `npx wrangler deploy`

### 4. ตั้ง Variables & Secrets
Worker → **Settings → Variables and Secrets** เพิ่มเป็นชนิด **Secret**:

| ชื่อ | ค่า |
|---|---|
| `ACCESS_PIN` | PIN สำหรับล็อกอิน เช่น `246810` |
| `VAPID_PUBLIC_KEY` | จากข้อ 2 |
| `VAPID_PRIVATE_JWK` | จากข้อ 2 (ทั้งก้อน JSON) |
| `VAPID_SUBJECT` | `mailto:อีเมลของคุณ` |

แล้วกด Deploy ใหม่ 1 ครั้ง

### 5. ใช้งานบน iPhone
1. เปิดลิงก์ `*.workers.dev` (หรือโดเมนของคุณ) ใน **Safari**
2. แชร์ → **Add to Home Screen**
3. เปิดจากไอคอนบนหน้าโฮม → ใส่ PIN
4. ส่วน Data → **Turn on reminders** → อนุญาต → **Send test**

### 6. ย้ายข้อมูลจากเวอร์ชันเดิม
ในหน้าเดิม (claude.ai) กด **Export JSON** → ในหน้าใหม่กด **Import JSON** เลือกไฟล์นั้น

## การแจ้งเตือน
Cron รันทุก 15 นาที แปลงเป็นเวลาไทย แล้วเด้งเฉพาะมื้อที่ถึงเวลาและ**ยังไม่ได้ติ๊ก**

| เวลา | รายการ |
|---|---|
| 08:00 | มื้อเช้า |
| 08:15 | วิตามินหลังมื้อเช้า |
| 12:30 | มื้อกลางวัน |
| 15:00 | มื้อบ่าย |
| 19:00 (เวทค่ำ 18:00) | มื้อเย็น |
| 19:15 (เวทค่ำ 18:15) | วิตามินหลังมื้อเย็น |

แก้เวลาหรือข้อความได้ที่ `REMINDERS` ใน `src/worker.js`

## รันในเครื่อง
```bash
npm install
cp .dev.vars.example .dev.vars   # ใส่ PIN และคีย์ VAPID
npm run dev
```
