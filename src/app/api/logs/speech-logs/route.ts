// src/app/api/speech-logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { buildTimeFilter, TimeRangeFilter } from "@/lib/helper/timeRange";
import SpeechLog from "@/models/SpeechLog";

type RegexFilter = {
  $regex: string;
  $options: string;
};

type SpeechLogFilter = TimeRangeFilter & {
  nodeId?: number;
  text?: RegexFilter;
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const baseFilter = buildTimeFilter(searchParams);
    const filter: SpeechLogFilter = { ...baseFilter };

    const nodeIdParam = searchParams.get("nodeId");
    if (nodeIdParam) {
      const nodeId = Number(nodeIdParam);
      if (!Number.isNaN(nodeId)) {
        filter.nodeId = nodeId;
      }
    }

    const q = searchParams.get("q");
    if (q && q.trim().length > 0) {
      filter.text = {
        $regex: q.trim(),
        $options: "i",
      };
    }

    const logs = await SpeechLog.find(filter).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const log = await SpeechLog.create(body);
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

    const result = await SpeechLog.deleteMany({
      timestamp: { $gte: fromDate, $lte: toDate },
    });

    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
