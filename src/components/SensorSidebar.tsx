"use client";

import { useEffect, useState } from "react";
import SensorInfo from "@/components/SensorInfo";

export default function SensorSidebar() {
  const [sensor, setSensor] = useState<SensorData>({ 
    temp: 0, 
    humidity: 0, 
    water: 0, 
    tilt: 0, 
    button: false 
  } as SensorData); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sensor");
        const data: SensorData = await res.json();
        setSensor(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
        setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 500); // ดึงข้อมูลทุก 1 วินาที
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading live sensor data...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📡 ค่าสถานะปัจจุบัน</h2>
      {/* ใช้ SensorInfo แสดงผล Grid Card */}
      <SensorInfo data={sensor} /> 
    </div>
  );
}