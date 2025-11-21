import { NextResponse } from "next/server";
import { fs } from "@/lib/config/api";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export async function GET() {
  const q = query(
    collection(fs, "logs"),
    orderBy("created_at", "desc"),
    limit(50)
  );

  const snap = await getDocs(q);

  const items = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(items);
}
