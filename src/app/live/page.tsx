"use client";

import { useEffect, useState } from "react";
import SensorInfo from "@/components/SensorInfo";

// ถ้า SensorData ไม่ได้ถูก declare ไว้ใน global scope คุณอาจต้อง import เข้ามา
// import type { SensorData } from "@/lib/types"; 

export default function LivePage() {
  // ใช้ any ไว้ก่อนเผื่อไม่มี type หรือใช้ SensorData ตามเดิมหากมีอยู่แล้ว
  const [sensor, setSensor] = useState<SensorData>({} as SensorData);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sensor");
        const data = await res.json();
        setSensor(data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    }

    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          📡 Live Sensor Dashboard
        </h1>
        <SensorInfo data={sensor} />
      </div>
    </div>
  );
}