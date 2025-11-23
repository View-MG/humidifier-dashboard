"use client";

import { useState } from "react";
import { 
  Power, 
  Clock, 
  Save, 
  Zap, 
  PlayCircle, 
  StopCircle, 
  RefreshCw
} from "lucide-react";

// Interface API
interface ApiPayload {
  type: "command" | "schedule";
  command?: string;
  startTime?: string;
  stopTime?: string;
  enabled?: boolean;
}

export default function ControlPage() {
  const [loading, setLoading] = useState(false);

  // State สำหรับตั้งเวลา (แยก Hour/Minute เพื่อความง่ายและบังคับ 24h)
  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin]   = useState("00");
  
  const [stopHour, setStopHour]   = useState("17");
  const [stopMin, setStopMin]     = useState("00");

  const [isScheduleEnabled, setIsScheduleEnabled] = useState(true);

  // ตัวช่วยสร้างตัวเลข 00-23 และ 00-59
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // ฟังก์ชันยิง API
  async function callApi(payload: ApiPayload) {
    try {
      setLoading(true);
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาด");
      } else {
        // Success Feedback เล็กๆ (console หรือ toast ถ้ามี)
        console.log("Success:", data.message);
      }
    } catch (err) {
      console.error(err);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  // 1. ส่งคำสั่ง Manual
  const handleCommand = (cmd: string) => {
    callApi({ type: "command", command: cmd });
  };

  // 2. บันทึกการตั้งเวลา
  const handleSaveSchedule = () => {
    const startTime = `${startHour}:${startMin}`;
    const stopTime = `${stopHour}:${stopMin}`;

    callApi({
      type: "schedule",
      startTime: startTime,
      stopTime: stopTime,
      enabled: isScheduleEnabled
    });
    
    alert(`บันทึกเวลาทำงาน: ${startTime} - ${stopTime} เรียบร้อยแล้ว!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      
      {/* --- Header --- */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-green-100 p-3 rounded-full mb-3 shadow-sm">
          <Zap className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Smart Farm Control</h1>
        <p className="text-slate-500 mt-1">ระบบควบคุมและตั้งเวลาอัตโนมัติ</p>
      </div>

      <div className="w-full max-w-lg space-y-6">

        {/* --- Card 1: Manual Control --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Power className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-700">สั่งงานทันที (Manual)</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCommand("open")}
              disabled={loading}
              className="flex flex-col items-center justify-center py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <PlayCircle className="w-6 h-6 mb-1" />
              <span className="font-semibold">เปิดน้ำ</span>
            </button>

            <button
              onClick={() => handleCommand("close")}
              disabled={loading}
              className="flex flex-col items-center justify-center py-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <StopCircle className="w-6 h-6 mb-1" />
              <span className="font-semibold">ปิดน้ำ</span>
            </button>

            <button
              onClick={() => handleCommand("auto")}
              disabled={loading}
              className="flex flex-col items-center justify-center py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-6 h-6 mb-1" />
              <span className="font-semibold">โหมด Auto</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">
            *กด "โหมด Auto" เพื่อกลับไปใช้ระบบตั้งเวลา
          </p>
        </div>

        {/* --- Card 2: Schedule Settings --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-700">ตั้งเวลาทำงาน</h2>
            </div>
            
            {/* Custom Toggle Switch */}
            <label className="flex items-center cursor-pointer select-none">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isScheduleEnabled}
                  onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isScheduleEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isScheduleEnabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="ml-2 text-sm font-medium text-slate-600">
                {isScheduleEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </label>
          </div>

          <div className={`space-y-5 transition-opacity ${isScheduleEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            
            {/* Start Time Row */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-slate-600 w-20">เริ่มทำงาน</span>
              <div className="flex items-center gap-2">
                <select 
                  value={startHour} 
                  onChange={(e) => setStartHour(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-lg font-bold rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block p-2 w-20 text-center appearance-none"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-400 font-bold">:</span>
                <select 
                  value={startMin} 
                  onChange={(e) => setStartMin(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-lg font-bold rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block p-2 w-20 text-center appearance-none"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-xs text-slate-400 ml-1">น.</span>
              </div>
            </div>

            {/* Stop Time Row */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-slate-600 w-20">หยุดทำงาน</span>
              <div className="flex items-center gap-2">
                <select 
                  value={stopHour} 
                  onChange={(e) => setStopHour(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-lg font-bold rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-2 w-20 text-center appearance-none"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-400 font-bold">:</span>
                <select 
                  value={stopMin} 
                  onChange={(e) => setStopMin(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-lg font-bold rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-2 w-20 text-center appearance-none"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-xs text-slate-400 ml-1">น.</span>
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>บันทึกเวลา</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}