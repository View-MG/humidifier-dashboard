"use client";

import { useState, useCallback, useEffect } from "react";
import { Power, Clock, Save, Zap, RefreshCw, Droplets, Fan } from "lucide-react";
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

  const [isFanOn, setIsFanOn] = useState(false);
  const [isSteamOn, setIsSteamOn] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  const [targetHumid, setTargetHumid] = useState("60");

  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [stopHour, setStopHour] = useState("17");
  const [stopMin, setStopMin] = useState("00");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

  // ✅ Helper: แปลง Unix Timestamp (Seconds) เป็น Hour/Minute
  const unixToTime = (timestampStr: string) => {
    if (!timestampStr || timestampStr === "0") return null;
    
    // API เราเก็บเป็น seconds แต่ JS Date ใช้ milliseconds
    const date = new Date(parseInt(timestampStr) * 1000);
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return { hh, mm };
  };

  // ✅ 1. เพิ่ม useEffect เพื่อดึงข้อมูลเริ่มต้นจาก API (GET)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/control"); // เรียก GET Method
        const json = await res.json();
        
        if (json.ok && json.data) {
          const { isFanOn, isSteamOn, mode, sched_start, sched_end, target_humidity } = json.data;

          const autoEnabled = mode === "auto";
          setIsAutoMode(autoEnabled);
          setTargetHumid(target_humidity.toString());

          // ✅ แก้ไข: ถ้า Auto Mode เปิดอยู่ ให้บังคับ Fan และ Steam เป็น ON
          // ถ้า Auto ปิดอยู่ ให้ใช้ค่าจริงจาก Database (isFanOn/isSteamOn)
          if (autoEnabled) {
            setIsFanOn(true);
            setIsSteamOn(true);
          } else {
            setIsFanOn(isFanOn);
            setIsSteamOn(isSteamOn);
          }

          // Update Schedule
          if (sched_start !== "0" && sched_end !== "0") {
             setIsScheduleEnabled(true);
             const start = unixToTime(sched_start);
             const end = unixToTime(sched_end);
             
             if (start) {
               setStartHour(start.hh);
               setStartMin(start.mm);
             }
             if (end) {
               setStopHour(end.hh);
               setStopMin(end.mm);
             }
          } else {
            setIsScheduleEnabled(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    fetchData();
  }, []);

  // convert time to UTC unix timestamp
  const convertToUnix = (hh: string, mm: string): number => {
    const d = new Date();
    d.setHours(parseInt(hh));
    d.setMinutes(parseInt(mm));
    d.setSeconds(0);
    d.setMilliseconds(0);

    return Math.floor(d.getTime() / 1000);
  };

  // API caller
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
  // Manual Fan Toggle
  // ------------------------------
  const handleFanToggle = () => {
    const newState = !isFanOn;

    const payload: ManualPayload = {
      type: "manual",
      fan_state: newState,
      steam_state: isSteamOn
    };

    callApi(payload);
    setIsFanOn(newState);
    setIsAutoMode(false);
  };

  // ------------------------------
  // Manual Steam Toggle
  // ------------------------------
  const handleSteamToggle = () => {
    const newState = !isSteamOn;

    const payload: ManualPayload = {
      type: "manual",
      fan_state: isFanOn,
      steam_state: newState
    };

    callApi(payload);
    setIsSteamOn(newState);
    setIsAutoMode(false);
  };

  // ------------------------------
  // Auto Mode Toggle
  // ------------------------------
  const handleAutoToggle = () => {
    const newMode = isAutoMode ? "off" : "auto";

    // ส่งค่า target_humidity ไปด้วย
    const payload: any = {
      type: "mode",
      mode: newMode as ModeType,
      target_humidity: parseInt(targetHumid) || 0
    };

    callApi(payload);

    setIsAutoMode(!isAutoMode);

    if (newMode === "auto") {
      setIsFanOn(true);
      setIsSteamOn(true);
    } else {
      setIsFanOn(false);
      setIsSteamOn(false);
    }
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
      <h1 className="text-xl font-bold mb-4 text-black">Smart Control System</h1>

      {apiMessage && (
        <div className="p-3 mb-3 text-center bg-green-100 text-gray-800 rounded-lg">
          {apiMessage}
        </div>
      )}

      {/* Manual section */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold mb-2 text-black">Manual Control</h2>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* ปุ่ม Fan */}
          <button
            disabled={loading || isAutoMode}
            onClick={handleFanToggle}
            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
              isFanOn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Fan className={`w-6 h-6 mb-2 ${isFanOn ? "text-white animate-spin" : "text-orange-500"}`} />
            <span>{isFanOn ? "เปิดอยู่ (Fan)" : "ปิดพัดลม"}</span>
          </button>

          {/* ปุ่ม Steam */}
          <button
            disabled={loading || isAutoMode}
            onClick={handleSteamToggle}
            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
              isSteamOn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Droplets className={`w-6 h-6 mb-2 ${isSteamOn ? "text-white" : "text-blue-500"}`} />
            <span>{isSteamOn ? "เปิดอยู่ (Steam)" : "ปิดสตรีม"}</span>
          </button>

        </div>
      </div>

      {/* Auto */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold mb-3 text-black">Auto Mode</h2>

        {/* ช่องใส่ความชื้น (%) */}
        <div className="mb-4">
          <label className="block text-black mb-2 text-sm font-medium">
            ความชื้นที่ต้องการ (%) 
            {isAutoMode && <span className="text-red-500 ml-2 text-xs">(ปิด Auto เพื่อแก้ไข)</span>}
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
              className={`w-full border border-gray-300 rounded-xl p-3 text-black pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isAutoMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"
              }`}
            />
            <span className="absolute right-4 top-3 text-gray-500 font-semibold">%</span>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleAutoToggle}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
             isAutoMode 
               ? "bg-indigo-600 text-white hover:bg-indigo-700" 
               : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
        >
          <RefreshCw className={isAutoMode ? "animate-spin" : ""} size={20} />
          {isAutoMode ? "ปิด Auto Mode" : "เปิด Auto Mode"}
        </button>
      </div>

      {/* Schedule */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3 text-black">Scheduling</h2>

        <div 
          className="flex justify-end items-center mb-4 cursor-pointer gap-3" 
          onClick={() => setIsScheduleEnabled(!isScheduleEnabled)}
        >
          <span className="text-black font-medium select-none">เปิดการตั้งเวลา</span>

          <div className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out ${
            isScheduleEnabled ? "bg-green-500" : "bg-gray-300"
          }`}>
            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-200 ease-in-out ${
              isScheduleEnabled ? "translate-x-5" : "translate-x-0"
            }`} />
          </div>
        </div>

        <div className={`space-y-4 text-black transition-opacity duration-300 ${isScheduleEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex justify-between items-center">
            <span>เริ่ม</span>
            <div className="flex gap-1">
              <select className="text-black bg-white border border-gray-300 rounded" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                {hours.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              :
              <select className="text-black bg-white border border-gray-300 rounded" value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span>สิ้นสุด</span>
            <div className="flex gap-1">
              <select className="text-black bg-white border border-gray-300 rounded" value={stopHour} onChange={(e) => setStopHour(e.target.value)}>
                {hours.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              :
              <select className="text-black bg-white border border-gray-300 rounded" value={stopMin} onChange={(e) => setStopMin(e.target.value)}>
                {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button
            disabled={loading || !isScheduleEnabled}
            onClick={handleSaveSchedule}
            className="w-full bg-green-600 text-white py-3 rounded-xl mt-2 flex justify-center items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock size={20} />
            บันทึกเวลา
          </button>
        </div>
      </div>
    </div>
  );
}