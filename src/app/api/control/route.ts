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
      
      await db.ref("fan/control").update({
        mode: body.mode,
        updated_at: Date.now(),
      });

      await db.ref("steam/control").update({
        mode: body.mode,
        update_at: Date.now()
      });

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

// ✅ ฟังก์ชัน GET ที่แก้ไขแล้ว
export async function GET() {
  try {
    // 1. ดึงข้อมูล Control ทั้งหมด (รวม manual_state, mode, schedule)
    // การดึงทั้งก้อน fan/control จะได้ manual_state ที่อยู่ข้างในมาด้วยเลย
    const fanControlSnap = await db.ref("fan/control").get(); 
    const steamControlSnap = await db.ref("steam/control").get();
    
    // 2. ดึง Humidity
    const humidControlSnap = await db.ref("humidity/control").get();

    const fanData = fanControlSnap.val() || {};
    const steamData = steamControlSnap.val() || {};
    const humidData = humidControlSnap.val() || {};

    // จัดเตรียมข้อมูลส่งกลับ
    const responseData = {
      // ✅ ดึงค่า manual_state จาก path fan/control/manual_state ที่ถูกต้อง
      isFanOn: fanData.manual_state ?? false, 
      isSteamOn: steamData.manual_state ?? false,
      
      // Mode (ดึงจาก fan/control/mode)
      mode: fanData.mode ?? "off",
      
      // Schedule (ดึงจาก fan/control/sched_start...)
      sched_start: fanData.sched_start ?? "0",
      sched_end: fanData.sched_end ?? "0",
      
      // Humidity
      target_humidity: humidData.target_humidity ?? 60
    };

    return NextResponse.json({ ok: true, data: responseData });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch data" }, { status: 500 });
  }
}