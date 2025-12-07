"use client";

import { useState, useCallback, useEffect } from "react";
import { Clock, RefreshCw, Power, Thermometer, Zap, Calendar } from "lucide-react";
// import database client
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase/firebaseClient";

import type {
  ControlPayload,
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

  // Helper: Call API
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
        setTimeout(() => setApiMessage(""), 3000);
      }
    } catch {
      setApiMessage("❌ API Error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Voice Listener
  useEffect(() => {
    const speechRef = ref(db, 'speech_latest/text');
    const unsubscribe = onValue(speechRef, async (snapshot) => {
      const text = snapshot.val();
      if (typeof text === 'string' && text.trim() !== "") {
        const lowerText = text.toLowerCase();
        let commandState: boolean | null = null;

        if (lowerText.includes("open")) {
          commandState = true;
        } else if (lowerText.includes("close")) {
          commandState = false;
        }

        if (commandState !== null) {
          console.log(`🎤 Voice Detected: "${text}" -> Action: ${commandState}`);
          await callApi({
            type: "manual",
            control: commandState
          });
          setIsControlOn(commandState);
          setIsAutoMode(false);
          set(speechRef, "");
        }
      }
    });
    return () => unsubscribe();
  }, [callApi]);

  // Fetch Initial Data
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

          if (sched_start && sched_start.includes(":")) {
            const [hh, mm] = sched_start.split(":");
            setStartHour(hh); setStartMin(mm);
          }
          if (sched_end && sched_end.includes(":")) {
            const [hh, mm] = sched_end.split(":");
            setStopHour(hh); setStopMin(mm);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    fetchData();
  }, []);

  // Actions
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

    // เมื่อกด Toggle ให้ยิง API ไปบันทึกสถานะใหม่ พร้อมกับเวลาปัจจุบันที่ตั้งไว้
    const payload: SchedulePayload = {
      type: "schedule",
      enabled: nextState,
      sched_start: `${startHour}:${startMin}`,
      sched_end: `${stopHour}:${stopMin}`,
    };
    callApi(payload);
  };

  const handleSaveSchedule = () => {
    const payload: SchedulePayload = {
      type: "schedule",
      enabled: isScheduleEnabled,
      sched_start: `${startHour}:${startMin}`,
      sched_end: `${stopHour}:${stopMin}`,
    };

    callApi(payload);
  };

  return (
    // Background: Dark gradient with subtle tech vibes
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black text-gray-100 p-6 flex items-center justify-center font-sans">
      
      <div className="w-full max-w-lg relative">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg">
              CONTROL CENTER
            </h1>
            <p className="text-gray-500 text-sm tracking-widest uppercase mt-2">Smart Huminity</p>
          </div>

          {/* Alert Message */}
          <div className={`transition-all duration-500 overflow-hidden ${apiMessage ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="mx-auto w-fit px-6 py-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-sm font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {apiMessage}
            </div>
          </div>

          {/* 1. Power Control Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <Zap size={18} className="text-cyan-400" />
                <span className="text-sm font-bold tracking-wider uppercase">System Power</span>
              </div>

              <button
                disabled={loading || isAutoMode}
                onClick={handlePowerToggle}
                className={`w-full relative py-8 rounded-xl flex items-center justify-center gap-4 transition-all duration-500 border overflow-hidden ${
                  isControlOn
                    ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] text-cyan-50"
                    : "bg-neutral-800/50 border-white/5 text-gray-500 hover:bg-neutral-800"
                } ${isAutoMode ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
              >
                 {/* Glowing Background for ON state */}
                 {isControlOn && <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />}

                <Power className={`w-10 h-10 z-10 ${isControlOn ? "drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" : ""}`} />
                <span className="text-2xl font-black tracking-widest z-10">
                  {isControlOn ? "ACTIVE" : "STANDBY"}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Auto Mode Card */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl shadow-lg p-6">
             <div className="flex items-center gap-3 mb-4 text-gray-400">
                <RefreshCw size={18} className="text-fuchsia-400" />
                <span className="text-sm font-bold tracking-wider uppercase">Auto Automation</span>
              </div>

            <div className="flex gap-4 items-end mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Target Humidity</label>
                <div className="relative group/input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetHumid}
                    onChange={(e) => setTargetHumid(e.target.value)}
                    disabled={loading || isAutoMode}
                    className={`w-full bg-black/40 border text-2xl font-mono p-3 pl-12 rounded-lg transition-all focus:outline-none ${
                        isAutoMode 
                        ? "border-white/5 text-gray-600 cursor-not-allowed" 
                        : "border-white/10 text-white focus:border-fuchsia-500/50 focus:shadow-[0_0_20px_-5px_rgba(217,70,239,0.3)]"
                    }`}
                  />
                  <Thermometer className={`absolute left-4 top-4 w-5 h-5 transition-colors ${isAutoMode ? 'text-gray-700' : 'text-fuchsia-500'}`} />
                  <span className="absolute right-4 top-4 text-gray-500 font-mono">%</span>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleAutoToggle}
              className={`w-full py-4 rounded-lg flex items-center justify-center gap-3 font-bold tracking-wide transition-all duration-300 border ${
                isAutoMode
                  ? "bg-fuchsia-950/30 border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_30px_-10px_rgba(192,38,211,0.4)]"
                  : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <RefreshCw className={isAutoMode ? "animate-spin" : ""} size={20} />
              {isAutoMode ? "AUTO MODE : ON" : "ENABLE AUTO MODE"}
            </button>
          </div>

          {/* 3. Schedule Card */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar size={18} className="text-emerald-400" />
                <span className="text-sm font-bold tracking-wider uppercase">Scheduler</span>
              </div>
              
              {/* Custom Toggle Switch */}
              <div 
                onClick={handleToggleSchedule}
                className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 ${isScheduleEnabled ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-neutral-800 border border-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${
                    isScheduleEnabled ? 'translate-x-7 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'translate-x-0 bg-gray-500'
                }`} />
              </div>
            </div>

            {/* ส่วนที่แก้ไข: ลบ opacity และ pointer-events-none ออก เพื่อให้แก้ได้ตลอดเวลา */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="block text-xs text-gray-500 mb-1 uppercase text-center">Start Time</span>
                  <div className="flex justify-center items-center gap-1 font-mono text-lg">
                    <select className="bg-transparent text-white focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                      {hours.map((h) => <option key={h} value={h} className="bg-neutral-900">{h}</option>)}
                    </select>
                    <span className="text-gray-600">:</span>
                    <select className="bg-transparent text-white focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors" value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                      {minutes.map((m) => <option key={m} value={m} className="bg-neutral-900">{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Stop Time */}
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="block text-xs text-gray-500 mb-1 uppercase text-center">Stop Time</span>
                  <div className="flex justify-center items-center gap-1 font-mono text-lg">
                    <select className="bg-transparent text-white focus:outline-none cursor-pointer hover:text-red-400 transition-colors" value={stopHour} onChange={(e) => setStopHour(e.target.value)}>
                      {hours.map((h) => <option key={h} value={h} className="bg-neutral-900">{h}</option>)}
                    </select>
                    <span className="text-gray-600">:</span>
                    <select className="bg-transparent text-white focus:outline-none cursor-pointer hover:text-red-400 transition-colors" value={stopMin} onChange={(e) => setStopMin(e.target.value)}>
                      {minutes.map((m) => <option key={m} value={m} className="bg-neutral-900">{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handleSaveSchedule}
                className="w-full py-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] transition-all font-medium flex justify-center items-center gap-2"
              >
                <Clock size={18} />
                Save Schedule
              </button>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-700 font-mono">
             SYSTEM ID: ESP32-CTRL-01 • CONNECTED
          </div>

        </div>
      </div>
    </div>
  );
}