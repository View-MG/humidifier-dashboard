"use client";

import { useEffect, useState } from "react";
import SensorInfo from "@/components/SensorInfo";

export default function LivePage() {
  const [sensor, setSensor] = useState<SensorData>({} as SensorData);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/sensor");
      const data = await res.json();
      setSensor(data);
    }

    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📡 Live Sensor Dashboard</h1>
      <SensorInfo data={sensor} />
    </div>
  );
}
