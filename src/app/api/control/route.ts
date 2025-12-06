import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";
import type { ControlPayload } from "@/lib/types/control";

export async function POST(req: NextRequest) {
  try {
    const body: ControlPayload | any = await req.json();

    // 1. Manual Control
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

    // 2. Mode Control (Auto/Off)
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
    // 3. Schedule Control (จุดที่แก้ไข)
    // -------------------------------------------------------
    if (body.type === "schedule") {
      // 3.1 บันทึกสถานะ Enable/Disable ไว้ที่ node แยก
      await db.ref("schedule/enable").set(body.enabled);

      // 3.2 บันทึกเวลาเริ่ม-จบ (แก้ไข: บันทึกเวลาตามที่ส่งมาเสมอ ไม่ต้องเช็ค enabled)
      // เพื่อให้ Hardware อ่านค่าเวลาได้ตลอด และ UI ไม่รีเซ็ตค่าเป็น 0
      const schedData = {
        sched_start: body.sched_start ?? "0",
        sched_end: body.sched_end ?? "0",
        updated_at: Date.now(),
      };

      await db.ref("fan/control").update(schedData);
      await db.ref("steam/control").update(schedData);

      return NextResponse.json({ 
        ok: true, 
        message: body.enabled ? "เปิดการตั้งเวลาแล้ว" : "ปิดการตั้งเวลา (บันทึกเวลาเดิมไว้)" 
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ ok: false, error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const fanControlSnap = await db.ref("fan/control").get(); 
    const steamControlSnap = await db.ref("steam/control").get();
    const humidControlSnap = await db.ref("humidity/control").get();
    const scheduleEnableSnap = await db.ref("schedule/enable").get();

    const fanData = fanControlSnap.val() || {};
    const steamData = steamControlSnap.val() || {};
    const humidData = humidControlSnap.val() || {};
    const scheduleEnabled = scheduleEnableSnap.val(); 

    const responseData = {
      isFanOn: fanData.manual_state ?? false, 
      isSteamOn: steamData.manual_state ?? false,
      mode: fanData.mode ?? "off",
      sched_start: fanData.sched_start ?? "0",
      sched_end: fanData.sched_end ?? "0",
      target_humidity: humidData.target_humidity ?? 60,
      schedule_enabled: scheduleEnabled
    };

    return NextResponse.json({ ok: true, data: responseData });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch data" }, { status: 500 });
  }
}