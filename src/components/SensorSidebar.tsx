"use client";

import { useEffect, useState } from "react";
import SensorInfo from "@/components/SensorInfo";

// กำหนด type ของ State ให้เป็น any เพื่อให้รองรับทั้ง SensorData (ตัวเลข) และ fallback (string "-") ได้
// หรือถ้าต้องการ strict type ควรแก้ SensorData ให้รับ string | number ได้ครับ
export default function SensorSidebar() {
  // 1. เปลี่ยนค่าเริ่มต้นเป็น null
  const [sensor, setSensor] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sensor");
        
        // เช็คว่า API ตอบกลับมาถูกต้องหรือไม่ (200 OK)
        if (!res.ok) {
            throw new Error("API response was not ok");
        }

        const data = await res.json();
        
        // เช็คว่า data มีข้อมูลจริงหรือไม่ (เผื่อได้ empty object {})
        if (!data || Object.keys(data).length === 0) {
            throw new Error("Empty data");
        }

        setSensor(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
        // 2. ถ้า error ให้เซ็ตเป็น null เพื่อให้เข้าเงื่อนไขแสดงขีด "-"
        setSensor(null); 
        setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 500); // ดึงข้อมูลทุก 0.5 วินาที
    return () => clearInterval(interval);
  }, []);

  // 3. เตรียมข้อมูลสำหรับแสดงผล
  // ถ้า sensor เป็น null (หาไม่เจอ/error) ให้ใช้ค่า "-" แทน
  const displayData = sensor || {
    temp: "-",
    humidity: "-",
    water: "-",
    tilt: "-",
    button: "-" // ถ้า SensorInfo ของคุณรองรับการแสดง string ในช่องนี้
  };

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
      {/* ส่ง displayData ที่จัดการเรื่องค่าว่างแล้วเข้าไป */}
      <SensorInfo data={displayData} /> 
    </div>
  );
}