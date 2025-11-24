import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin"; // ตรวจสอบ path นี้ให้ถูกต้องตามโปรเจคของคุณ

// 🚨 Interface สำหรับรับข้อมูลจาก Frontend (ปรับปรุงแล้ว)
interface ControlRequestBody {
  type: "command" | "schedule"; 
  // แยก command ของ fan และ motor ออกจากกัน
  command?: "fan_on" | "fan_off" | "motor_on" | "motor_off" | "auto_on" | "auto_off" | "set_humidity"; 
  value?: string;  // ค่าความชื้น
  startTime?: string; 
  stopTime?: string; 
  enabled?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: ControlRequestBody = await req.json();

    // 1. กรณีสั่งงาน Command (Manual / Auto / Humidity)
    if (body.type === "command" && body.command) {
 
      if (body.command === "set_humidity") {
      // 📍 กรณีตั้งค่าความชื้น
        const targetHumidity = parseInt(body.value || "0");
        
        if (isNaN(targetHumidity) || targetHumidity < 0 || targetHumidity > 100) {
            return NextResponse.json({ ok: false, error: "Invalid humidity value" }, { status: 400 });
        }

        // บันทึกลง Firebase (path config)
        await db.ref("config").update({
            target_humidity: targetHumidity,
            updatedAt: Date.now(),
        });

        return NextResponse.json({ ok: true, message: `Target humidity set to ${targetHumidity}%` });

      } else if (["fan_on", "fan_off", "motor_on", "motor_off", "auto_on", "auto_off"].includes(body.command)) {
        // 📍 กรณีสั่งเปิด/ปิดอุปกรณ์ (Fan/Motor) หรือโหมด Auto
        await db.ref("command").set({
          value: body.command,
          timestamp: Date.now(),
        });
        return NextResponse.json({ ok: true, message: `Command ${body.command} sent` });
      } else {
        // กรณี command ไม่ถูกต้องนอกเหนือจากที่กำหนด
        return NextResponse.json({ ok: false, error: "Invalid command" }, { status: 400 });
      }
    }

    // 2. กรณีตั้งค่าเวลา (Schedule)
    if (body.type === "schedule") {
      await db.ref("schedule").update({
        start_time: body.startTime || "00:00",
        stop_time: body.stopTime || "00:00",
        enabled: body.enabled ?? false,
        updatedAt: Date.now()
      });
      
      return NextResponse.json({ ok: true, message: "Schedule updated" });
    }

    return NextResponse.json({ ok: false, error: "Invalid request payload" }, { status: 400 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}