import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";

// Helper Function: จัด Format เวลาให้เป็น HH:MM เสมอ
const formatTime = (time: any) => {
  if (!time || time === "0") return "00:00";
  const str = String(time);
  if (str.includes(":")) {
    const parts = str.split(":");
    return `${parts[0]}:${parts[1]}`;
  }
  return str;
};

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // 1. Manual Control
    if (body.type === "manual") {
      const newState = body.control; 

      await db.ref("control").update({
        mode: "manual",
        manual_state: newState, 
        updated_at: Date.now(),
      });
      
      const msg = newState ? "ON" : "OFF";
      return NextResponse.json({ ok: true, message: `System Manual: ${msg}` });
    }

    // 2. Mode Control
    if (body.type === "mode") {
      const updateData: any = {
        mode: body.mode,
        updated_at: Date.now(),
      };

      if (body.mode === "auto") {
        updateData.manual_state = false;
      }

      await db.ref("control").update(updateData);

      if (body.mode === "auto") {
        const targetHumid = body.target_humidity ?? 0;
        await db.ref("humidity/control").update({
          target_humidity: targetHumid,
          updated_at: Date.now()
        });
        return NextResponse.json({ ok: true, message: `Mode Auto ON. Humidity set to ${targetHumid}%` });
      }
      
      return NextResponse.json({ ok: true, message: `Mode set to ${body.mode.toUpperCase()}` });
    }

    // 3. Schedule Control
    if (body.type === "schedule") {
      await db.ref("schedule").update({
        enable: body.enabled,
        start_time: formatTime(body.sched_start),
        stop_time: formatTime(body.sched_end),
        updated_at: Date.now()
      });

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
    // -------------------------------------------------------------
    // ส่วนที่เพิ่ม: ตรวจสอบ Voice Command (Speech Text)
    // -------------------------------------------------------------
    const speechRef = db.ref("speech_latest/text");
    const speechSnap = await speechRef.get();
    const speechText = speechSnap.val();

    if (typeof speechText === "string" && speechText.trim() !== "") {
      const lowerText = speechText.toLowerCase();
      let targetState: boolean | null = null;

      // ตรวจสอบ Substring
      if (lowerText.includes("open") || lowerText.includes("start") || lowerText.includes("okay")) {
        targetState = true;
      } else if (lowerText.includes("close") || lowerText.includes("stop")) {
        targetState = false;
      }

      // ถ้าเจอคำสั่ง (open หรือ close)
      if (targetState !== null) {
        // 1. อัปเดตสถานะ Control
        await db.ref("control").update({
          mode: "manual",         // เปลี่ยนเป็น Manual ทันที
          manual_state: targetState,
          control_state: targetState,
          updated_at: Date.now()
        });

        // 2. ***สำคัญ*** ลบข้อความเสียงทิ้ง (เพื่อไม่ให้มันทำงานซ้ำวนลูป)
        await speechRef.set(""); 
        
        // Log สำหรับ Debug
        console.log(`Voice Command Processed: "${speechText}" -> State: ${targetState}`);
      }
    }

    // -------------------------------------------------------------
    // ดึงข้อมูลปกติ (หลังจาก Process Voice Command เสร็จแล้ว)
    // -------------------------------------------------------------
    
    // ดึง node control
    const controlSnap = await db.ref("control").get(); 
    // ดึง node humidity
    const humidControlSnap = await db.ref("humidity/control").get();
    // ดึง node schedule
    const scheduleSnap = await db.ref("schedule").get();

    const controlData = controlSnap.val() || {};
    const humidData = humidControlSnap.val() || {};
    const scheduleData = scheduleSnap.val() || {}; 

    const masterState = controlData.control_state ?? controlData.manual_state ?? false;

    const responseData = {
      control: masterState, 
      mode: controlData.mode ?? "off",
      
      sched_start: formatTime(scheduleData.start_time), 
      sched_end: formatTime(scheduleData.stop_time),    
      
      target_humidity: humidData.target_humidity ?? 60,
      
      schedule_enabled: scheduleData.enable ?? false 
    };

    return NextResponse.json({ ok: true, data: responseData });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch data" }, { status: 500 });
  }
}