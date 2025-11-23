import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";

// Interface สำหรับรับข้อมูลจาก Frontend
interface ControlRequestBody {
  type: "command" | "schedule"; // ระบุประเภทการกระทำ
  command?: string;             // ใช้เมื่อ type = command
  startTime?: string;           // ใช้เมื่อ type = schedule (Format "HH:MM")
  stopTime?: string;            // ใช้เมื่อ type = schedule (Format "HH:MM")
  enabled?: boolean;            // ใช้เมื่อ type = schedule
}

export async function POST(req: NextRequest) {
  try {
    const body: ControlRequestBody = await req.json();

    // กรณีสั่งงาน Manual (Open, Close, Auto)
    if (body.type === "command" && body.command) {
      // อิงตาม C++: config.readString("/command/value")
      await db.ref("command").set({
        value: body.command,
        timestamp: Date.now(),
      });
      return NextResponse.json({ ok: true, message: `Command ${body.command} sent` });
    }

    // กรณีตั้งค่าเวลา (Schedule)
    if (body.type === "schedule") {
      // อิงตาม C++: /schedule/start_time, /schedule/stop_time, /schedule/enabled
      await db.ref("schedule").update({
        start_time: body.startTime || "00:00",
        stop_time: body.stopTime || "00:00",
        enabled: body.enabled ?? false, // ถ้าไม่ส่งมาให้ถือว่า false
        updatedAt: Date.now()
      });

      // หาก User กด Save Schedule เราอาจจะอยากให้เปลี่ยนโหมดเป็น Auto เลยหรือไม่?
      // ในที่นี้แยกกันดีกว่า ให้ User กดปุ่ม "โหมด Auto" เองถ้าต้องการ
      
      return NextResponse.json({ ok: true, message: "Schedule updated" });
    }

    return NextResponse.json({ ok: false, error: "Invalid request type" }, { status: 400 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}