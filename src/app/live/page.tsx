"use client";

import { useEffect, useState } from "react";

interface SensorData {
  temp?: number;
  humidity?: number;
  water?: number;
  tilt?: number;
  button?: boolean;
}

export default function LivePage() {
  const [sensor, setSensor] = useState<SensorData>({});

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
    <div className="p-6">
      <h1 className="text-2xl font-bold">Live Sensor Data</h1>

      <div className="mt-4 space-y-2 text-lg">
        <p>🌡 Temp: {sensor.temp ?? "--"} °C</p>
        <p>💧 Humidity: {sensor.humidity ?? "--"}%</p>
        <p>🚰 Water: {sensor.water ?? "--"}%</p>
        <p>🎚 Tilt: {sensor.tilt ?? "--"}</p>
        <p>🔘 Button: {sensor.button ? "Pressed" : "Released"}</p>
      </div>
    </div>
  );
}
