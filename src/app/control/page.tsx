"use client";

import { useState, useCallback } from "react";
import { Power, Clock, Save, Zap, RefreshCw, Droplets } from "lucide-react";
import type {
  ControlPayload,
  ManualPayload,
  ModePayload,
  SchedulePayload,
  ApiResponse,
  ModeType
} from "@/lib/types/control";

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export default function ControlPage() {
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const [isMotorOn, setIsMotorOn] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [stopHour, setStopHour] = useState("17");
  const [stopMin, setStopMin] = useState("00");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(true);

  // convert time to UTC unix timestamp
  const convertToUnix = (hh: string, mm: string): number => {
  const d = new Date();
  d.setHours(parseInt(hh));
  d.setMinutes(parseInt(mm));
  d.setSeconds(0);
  d.setMilliseconds(0);

  return Math.floor(d.getTime() / 1000); // <-- ใช้อันนี้เท่านั้น!
};


  // API caller (strict type)
  const callApi = useCallback(async (payload: ControlPayload) => {
    setLoading(true);
    setApiMessage("");

    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.ok) {
        setApiMessage("❌ " + (data.error || "Error"));
      } else {
        setApiMessage("✅ " + (data.message || "Success"));
      }
    } catch {
      setApiMessage("❌ API Error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------
  // Manual Motor Toggle
  // ------------------------------
  const handleMotorToggle = () => {
    const newState = !isMotorOn;

    const payload: ManualPayload = {
      type: "manual",
      manual_state: newState,
    };

    callApi(payload);

    setIsMotorOn(newState);
    setIsAutoMode(false);
  };

  // ------------------------------
  // Auto Mode Toggle
  // ------------------------------
  const handleAutoToggle = () => {
    const newMode = isAutoMode ? "off" : "auto";

    const payload: ModePayload = {
      type: "mode",
      mode: newMode as ModeType,
    };

    callApi(payload);

    setIsAutoMode(!isAutoMode);
    if (newMode === "off") setIsMotorOn(false);
  };

  // ------------------------------
  // Save Schedule
  // ------------------------------
  const handleSaveSchedule = () => {
    if (!isScheduleEnabled) {
      const payload: SchedulePayload = {
        type: "schedule",
        enabled: false,
      };
      callApi(payload);
      return;
    }

    const payload: SchedulePayload = {
      type: "schedule",
      enabled: true,
      sched_start: convertToUnix(startHour, startMin).toString(),
      sched_end: convertToUnix(stopHour, stopMin).toString(),
    };

    callApi(payload);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Smart Motor Control</h1>

      {apiMessage && (
        <div className="p-3 mb-3 text-center bg-green-100 text-green-700 rounded-lg">
          {apiMessage}
        </div>
      )}

      {/* Manual section */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold mb-2">Manual Control</h2>
        <button
          disabled={loading || isAutoMode}
          onClick={handleMotorToggle}
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
        >
          {isMotorOn ? "ปิดมอเตอร์" : "เปิดมอเตอร์"}
        </button>
      </div>

      {/* Auto */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold mb-2">Auto Mode</h2>
        <button
          disabled={loading}
          onClick={handleAutoToggle}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          {isAutoMode ? "ปิด Auto Mode" : "เปิด Auto Mode"}
        </button>
      </div>

      {/* Schedule */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Scheduling</h2>

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isScheduleEnabled}
            onChange={(e) => setIsScheduleEnabled(e.target.checked)}
          />
          <span className="ml-2">เปิดการตั้งเวลา</span>
        </label>

        <div className="space-y-4">
          {/* Start */}
          <div className="flex justify-between items-center">
            <span>เริ่ม</span>
            <div className="flex gap-1">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                {hours.map((h) => <option key={h}>{h}</option>)}
              </select>
              :
              <select value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                {minutes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* End */}
          <div className="flex justify-between items-center">
            <span>สิ้นสุด</span>
            <div className="flex gap-1">
              <select value={stopHour} onChange={(e) => setStopHour(e.target.value)}>
                {hours.map((h) => <option key={h}>{h}</option>)}
              </select>
              :
              <select value={stopMin} onChange={(e) => setStopMin(e.target.value)}>
                {minutes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleSaveSchedule}
            className="w-full bg-green-600 text-white py-3 rounded-xl mt-2"
          >
            บันทึกเวลา
          </button>
        </div>
      </div>
    </div>
  );
}
