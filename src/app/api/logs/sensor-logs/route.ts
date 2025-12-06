import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { buildSensorFilter } from "@/lib/helper/sensorFilter";
import type { SensorLogPayload } from "@/lib/types/sensor";
import SensorLog from "@/models/SensorLog";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const filter = buildSensorFilter(searchParams);

    const nodeIdParam = searchParams.get("nodeId");
    if (nodeIdParam) {
      const nodeId = Number(nodeIdParam);
      if (!Number.isNaN(nodeId)) {
        filter.nodeId = nodeId;
      }
    }

    const logs = await SensorLog.find(filter).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as SensorLogPayload;

    const log = await SensorLog.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "query param 'from' และ 'to' จำเป็นต้องมีทั้งคู่" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return NextResponse.json(
        {
          error:
            "รูปแบบวันที่ไม่ถูกต้อง ใช้ ISO string เช่น 2025-12-07T10:00:00+07:00",
        },
        { status: 400 }
      );
    }

    const result = await SensorLog.deleteMany({
      timestamp: { $gte: fromDate, $lte: toDate },
    });

    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
