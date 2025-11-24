import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";
import type { ControlPayload } from "@/lib/types/control";

export async function POST(req: NextRequest) {
  try {
    const body: ControlPayload = await req.json();

    if (body.type === "manual") {
      await db.ref("motor/control").update({
        mode: "manual",
        manual_state: body.manual_state,
        updated_at: Date.now(),
      });
      return NextResponse.json({ ok: true, message: "Manual updated" });
    }

    if (body.type === "mode") {
      await db.ref("motor/control").update({
        mode: body.mode,
        updated_at: Date.now(),
      });
      return NextResponse.json({ ok: true, message: "Mode updated" });
    }

    if (body.type === "schedule") {

      // schedule off
      if (!body.enabled) {
        await db.ref("motor/control").update({
          sched_start: "0",
          sched_end: "0",
          updated_at: Date.now(),
        });
        return NextResponse.json({ ok: true, message: "Schedule disabled" });
      }

      await db.ref("motor/control").update({
        sched_start: body.sched_start ?? "0",
        sched_end: body.sched_end ?? "0",
        updated_at: Date.now(),
      });

      return NextResponse.json({ ok: true, message: "Schedule updated" });
    }

    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server Error" }, { status: 500 });
  }
}
