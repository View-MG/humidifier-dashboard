"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  temp: number;
  humidity: number;
  water: number;
  tilt: number;
  button: boolean;
  created_at: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Sensor Logs (latest 50)</h1>

      <div className="mt-6 space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="border rounded-md p-4 bg-gray-100">
            <p className="font-semibold">{log.created_at}</p>
            <p>Temp: {log.temp}</p>
            <p>Humidity: {log.humidity}</p>
            <p>Water: {log.water}</p>
            <p>Tilt: {log.tilt}</p>
            <p>Button: {log.button ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
