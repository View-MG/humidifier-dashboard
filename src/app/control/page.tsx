"use client";

import { useState, useCallback, useEffect } from "react";
import { Clock, RefreshCw, Power } from "lucide-react";
import type {
  ControlPayload,
  // ManualPayload, // ถ้าไม่ได้ใช้ลบออกได้
  SchedulePayload,
  ApiResponse,
  ModeType
} from "@/lib/types/control";

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export default function ControlPage() {
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const [isControlOn, setIsControlOn] = useState(false); 
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  const [targetHumid, setTargetHumid] = useState("60");

  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [stopHour, setStopHour] = useState("17");
  const [stopMin, setStopMin] = useState("00");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

  // 1. ดึงข้อมูลเริ่มต้นจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/control");
        const json = await res.json();
        
        if (json.ok && json.data) {
          const { control, mode, sched_start, sched_end, target_humidity, schedule_enabled } = json.data;

          const autoEnabled = mode === "auto";
          setIsAutoMode(autoEnabled);
          setTargetHumid(target_humidity.toString());

          if (autoEnabled) {
            setIsControlOn(true);
          } else {
            setIsControlOn(!!control);
          }

          setIsScheduleEnabled(!!schedule_enabled);
          
          // --- แก้ไข: รับค่า HH:MM โดยตรงแล้ว split ใส่ State ---
          if (sched_start && sched_start.includes(":")) {
             const [hh, mm] = sched_start.split(":");
             setStartHour(hh);
             setStartMin(mm);
          }
          if (sched_end && sched_end.includes(":")) {
             const [hh, mm] = sched_end.split(":");
             setStopHour(hh);
             setStopMin(mm);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    fetchData();
  }, []);

  const callApi = useCallback(async (payload: ControlPayload | any) => {
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
  // Actions
  // ------------------------------

  const handlePowerToggle = () => {
    const newState = !isControlOn; 
    const payload = { 
        type: "manual", 
        control: newState 
    };
    callApi(payload);
    
    setIsControlOn(newState);
    setIsAutoMode(false);
  };

  const handleAutoToggle = () => {
    const newMode = isAutoMode ? "off" : "auto";
    const payload: any = { type: "mode", mode: newMode as ModeType, target_humidity: parseInt(targetHumid) || 0 };
    callApi(payload);
    setIsAutoMode(!isAutoMode);

    if (newMode === "auto") {
      setIsControlOn(true);
    } else {
      setIsControlOn(false);
    }
  };

  const handleToggleSchedule = () => {
    const nextState = !isScheduleEnabled;
    setIsScheduleEnabled(nextState);

    // --- แก้ไข: ส่ง HH:MM string ตรงๆ ---
    const payload: SchedulePayload = {
        type: "schedule",
        enabled: nextState,
        sched_start: `${startHour}:${startMin}`, 
        sched_end: `${stopHour}:${stopMin}`,
    };
    callApi(payload);
  };

  const handleSaveSchedule = () => {
    // --- แก้ไข: ส่ง HH:MM string ตรงๆ ---
    const payload: SchedulePayload = {
      type: "schedule",
      enabled: isScheduleEnabled, 
      sched_start: `${startHour}:${startMin}`,
      sched_end: `${stopHour}:${stopMin}`,
    };

    callApi(payload);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4 text-white">Smart Control System</h1>

        {apiMessage && (
          <div className="p-3 mb-3 text-center bg-green-900/40 border border-green-800 text-green-200 rounded-lg">
            {apiMessage}
          </div>
        )}

        {/* Manual section */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow mb-4">
          <h2 className="font-semibold mb-2 text-gray-200">System Power</h2>
          <div className="w-full">
            <button
              disabled={loading || isAutoMode}
              onClick={handlePowerToggle}
              className={`w-full py-6 rounded-xl flex flex-row items-center justify-center gap-3 transition-all duration-300 border ${
                isControlOn 
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                  : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"
              } ${isAutoMode ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Power className={`w-8 h-8 ${isControlOn ? "text-white drop-shadow-md" : "text-gray-500"}`} />
              <span className="text-xl font-bold tracking-wide">
                {isControlOn ? "SYSTEM ON" : "SYSTEM OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* Auto */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow mb-4">
          <h2 className="font-semibold mb-3 text-gray-200">Auto Mode</h2>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              ความชื้นที่ต้องการ (%) 
              {isAutoMode && <span className="text-red-400 ml-2 text-xs">(ปิด Auto เพื่อแก้ไข)</span>}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={targetHumid}
                onChange={(e) => setTargetHumid(e.target.value)}
                disabled={loading || isAutoMode}
                placeholder="Ex. 60"
                className={`w-full border rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isAutoMode 
                    ? "bg-zinc-900 border-zinc-800 text-gray-500 cursor-not-allowed" 
                    : "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500"
                }`}
              />
              <span className="absolute right-4 top-3 text-gray-400 font-semibold">%</span>
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleAutoToggle}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              isAutoMode 
                ? "bg-indigo-600 text-white hover:bg-indigo-500" 
                : "bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50 border border-indigo-900"
            }`}
          >
            <RefreshCw className={isAutoMode ? "animate-spin" : ""} size={20} />
            {isAutoMode ? "ปิด Auto Mode" : "เปิด Auto Mode"}
          </button>
        </div>

        {/* Schedule */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-200">Scheduling</h2>

          {/* ปุ่ม Toggle Enable/Disable */}
          <div 
            className="flex justify-end items-center mb-4 cursor-pointer gap-3" 
            onClick={handleToggleSchedule}
          >
            <span className="text-gray-300 font-medium select-none">เปิดการตั้งเวลา</span>
            <div className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out ${
              isScheduleEnabled ? "bg-green-600" : "bg-zinc-700"
            }`}>
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                isScheduleEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
          </div>

          <div className={`space-y-4 text-gray-300 transition-opacity duration-300`}>
            <div className="flex justify-between items-center">
              <span>เริ่ม</span>
              <div className="flex gap-1">
                <select className="bg-zinc-800 border border-zinc-700 text-white rounded p-1" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center text-gray-500">:</span>
                <select className="bg-zinc-800 border border-zinc-700 text-white rounded p-1" value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>สิ้นสุด</span>
              <div className="flex gap-1">
                <select className="bg-zinc-800 border border-zinc-700 text-white rounded p-1" value={stopHour} onChange={(e) => setStopHour(e.target.value)}>
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center text-gray-500">:</span>
                <select className="bg-zinc-800 border border-zinc-700 text-white rounded p-1" value={stopMin} onChange={(e) => setStopMin(e.target.value)}>
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <button
            disabled={loading}
            onClick={handleSaveSchedule}
            className={`w-full py-3 rounded-xl mt-4 flex justify-center items-center gap-2 transition-colors ${
              loading 
              ? "bg-zinc-700 cursor-not-allowed text-gray-500" 
              : "bg-green-700 hover:bg-green-600 text-white"
            }`}
          >
            <Clock size={20} />
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}