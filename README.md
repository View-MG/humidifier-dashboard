# Smart Humidifier — Dashboard + WebSocket (Local)

Repo นี้คือฝั่ง **Web Dashboard** (Next.js) และ **WebSocket Server** (Node.js) สำหรับระบบ Smart Humidifier  
ใช้สำหรับ ดูสถานะ/สั่งงาน และ รับเสียงจาก ESP32 เพื่อแปลงเสียงที่ได้เป็นข้อความพร้อมส่งไป Firebase

โครงสร้างโดยรวมตาม repo:
- `src/` : Next.js Dashboard (UI + API routes)
- `ws/` : WebSocket server

---

## Dashboard ทำอะไรได้บ้าง
- สั่งงาน **Manual ON/OFF**
- เปิด/ปิด **Auto mode** และตั้ง `target_humidity`
- เปิด/ปิด **Schedule** และตั้งเวลาเริ่ม/หยุด
- Voice Control
  - Dashboard **listen** ค่าใน Firebase RTDB ที่ `speech_latest/text`
  - ถ้าข้อความมีคำว่า `open` → สั่งเปิด, `close` → สั่งปิด

### Payload ที่ Dashboard ส่งไป `/api/control` เพื่อสั่ง Firebase ให้ Gateway Node ดึงค่า
- Manual:
```json
{ "type": "manual", "control": true }
```
- Auto / Mode:
```json
{ "type": "mode", "mode": "auto", "target_humidity": 60 }
```
หรือปิด auto:
```json
{ "type": "mode", "mode": "off", "target_humidity": 0 }
```
- Schedule:
```json
{ "type": "schedule", "enabled": true, "sched_start": "08:00", "sched_end": "10:30" }
```

---

## WebSocket Server (ws/) 
- รับ **PCM16 mono 16kHz** จาก ESP32 (stream เป็น binary)
- สะสม buffer แล้ว “ตัดไฟล์” ทุก ~4 วินาที
- เรียก `ffmpeg` แปลง raw → `.wav`
  
> ใช้สำหรับรับเสียงแล้วส่งต่อ API ของ Whisper AI สำหรับแปลง Speech To Text

## วิธีรันแบบ Local

### 1) ติดตั้ง dependencies
ใช้ได้ทั้ง npm หรือ pnpm
```bash
npm install
# หรือ
pnpm install
```

### 2) ตั้งค่า Firebase (จำเป็น)
โปรเจคนี้ใช้ Firebase client ในฝั่ง Dashboard (RTDB)
- สร้างไฟล์ `.env` แล้วใส่ค่า Firebase ของคุณ
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3) รัน Dashboard
```bash
npm run dev
# หรือ
pnpm dev
```
เปิด: http://localhost:3000

### 4) รัน WebSocket server
ในโฟลเดอร์ `ws/` (หรือถ้าไฟล์อยู่ที่อื่นให้ปรับ path)
```bash
node audio-server.js
# หรือ (ถ้าอยู่ใน ws/)
node ws/audio-server.js
```
---

## เชื่อมกับระบบ ESP32 (ภาพรวม)
- ESP32 (Gateway) จะสตรีมเสียงไปที่ `ws://<YOUR_PC_IP>:4000`
- Gateway/Sensor จะอ่าน/เขียนสถานะไป Firebase RTDB
- Dashboard อ่าน state ผ่าน `/api/control` และฟัง `speech_latest/text` เพื่อ trigger open/close

---

## Troubleshooting
- Dashboard เปิดแล้วไม่ขึ้นข้อมูล:
  - เช็ค `.env.local` และ Firebase `databaseURL`
  - เช็คว่า `/api/control` ทำงานได้ (ลอง refresh แล้วดู Network tab)
- WebSocket server เปิดได้ แต่ไม่เกิดไฟล์ `.wav`:
  - เช็คว่า `ffmpeg` ติดตั้งแล้ว (`ffmpeg -version`)
  - เช็คว่า ESP32 ส่ง format เป็น PCM16 16kHz mono จริง
- Voice trigger ไม่ทำงาน:
  - เช็คว่า RTDB มี path `speech_latest/text`
  - ค่าที่เขียนเข้าไปควรมีคำว่า `open` หรือ `close` (case-insensitive)

---

## Notes
- Repo นี้ใช้แบบ Local เป็นหลัก 
- แนะนำทำไฟล์ `.env` และเช็คการเชื่อมเกี่ยวกับ Firebase ให้ถูกต้อง
