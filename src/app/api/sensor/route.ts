import { NextResponse } from "next/server";
import { db } from "@/lib/config/api";
import { ref, get } from "firebase/database";

export async function GET() {
  const sensorRef = ref(db, "sensor");
  const snap = await get(sensorRef);

  return NextResponse.json(snap.val());
}
