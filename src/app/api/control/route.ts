import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";
import type { ControlPayload } from "@/lib/types/control";

export async function POST(req: NextRequest) {
  try {
    const body: ControlPayload | any = await req.json();

    // -------------------------------------------------------
    // 1. Manual Control
    // -------------------------------------------------------
    if (body.type === "manual") {
      await db.ref("fan/control").update({
        mode: "manual",
        manual_state: body.fan_state, 
        updated_at: Date.now(),
      });

      await db.ref("steam/control").update({
        mode: "manual",
        manual_state: body.steam_state,
        updated_at: Date.now(),
      });
      
      // ✅ แก้ไขข้อความแจ้งเตือนเป็น ON/OFF
      const fanMsg = body.fan_state ? "ON" : "OFF";
      const steamMsg = body.steam_state ? "ON" : "OFF";

      return NextResponse.json({ 
        ok: true, 
        message: `Fan: ${fanMsg}, Steam: ${steamMsg}` 
      });
    }

    // -------------------------------------------------------
    // 2. Mode Control (Auto/Off)
    // -------------------------------------------------------
    if (body.type === "mode") {
      
      // อัปเดต Mode ของ Fan
      await db.ref("fan/control").update({
        mode: body.mode,
        updated_at: Date.now(),
      });

      // อัปเดต Mode ของ Steam
      await db.ref("steam/control").update({
        mode: body.mode,
        update_at: Date.now()
      });

      // อัปเดตค่าความชื้น เฉพาะตอนที่เป็นโหมด "auto" เท่านั้น
      if (body.mode === "auto") {
        const targetHumid = body.target_humidity ?? 0;
        
        await db.ref("humidity/control").update({
          target_humidity: targetHumid,
          updated_at: Date.now()
        });
        
        return NextResponse.json({ ok: true, message: `Mode Auto ON. Humidity set to ${targetHumid}%` });
      }
      
      return NextResponse.json({ ok: true, message: `Mode Auto ${body.mode.toUpperCase()}` });
    }

    // -------------------------------------------------------
    // 3. Schedule Control
    // -------------------------------------------------------
    if (body.type === "schedule") {
      const schedData = {
        sched_start: body.enabled ? (body.sched_start ?? "0") : "0",
        sched_end: body.enabled ? (body.sched_end ?? "0") : "0",
        updated_at: Date.now(),
      };

      await db.ref("fan/control").update(schedData);
      await db.ref("steam/control").update(schedData);

      return NextResponse.json({ ok: true, message: body.enabled ? "Schedule updated" : "Schedule disabled" });
    }

    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ ok: false, error: "Server Error" }, { status: 500 });
  }
}

// ✅ เพิ่มฟังก์ชัน GET สำหรับดึงข้อมูลล่าสุด
export async function GET() {
  try {
    // 1. ดึง Fan/Steam State จาก path "status" ตามที่ขอ
    const fanStatusSnap = await db.ref("fan/status").get();
    const steamStatusSnap = await db.ref("steam/status").get();

    // 2. ดึง Mode และ Schedule จาก path "control" (เพราะเรา save ลง control)
    const fanControlSnap = await db.ref("fan/control").get(); 
    
    // 3. ดึง Humidity จาก path "humidity/control"
    const humidControlSnap = await db.ref("humidity/control").get();

    const fanStatus = fanStatusSnap.val() || {};
    const steamStatus = steamStatusSnap.val() || {};
    const fanControl = fanControlSnap.val() || {};
    const humidControl = humidControlSnap.val() || {};

    // จัดเตรียมข้อมูลส่งกลับ
    const responseData = {
      // ใช้ manual_state จาก status (ถ้าไม่มีให้ใช้ false)
      isFanOn: fanStatus.manual_state ?? false, 
      isSteamOn: steamStatus.manual_state ?? false,
      
      // Mode
      mode: fanControl.mode ?? "off",
      
      // Schedule (ถ้าเป็น "0" คือปิด)
      sched_start: fanControl.sched_start ?? "0",
      sched_end: fanControl.sched_end ?? "0",
      
      // Humidity
      target_humidity: humidControl.target_humidity ?? 60
    };

    return NextResponse.json({ ok: true, data: responseData });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch data" }, { status: 500 });
  }
}