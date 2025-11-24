"use client";

import { useState, useCallback } from "react";
import { 
  Power, 
  Clock, 
  Save, 
  Zap, 
  PlayCircle, 
  StopCircle, 
  RefreshCw,
  Droplets,
  Wind
} from "lucide-react";

// Interface API Payload
interface ApiPayload {
  type: "command" | "schedule";
  command?: "fan_on" | "fan_off" | "motor_on" | "motor_off" | "auto_on" | "auto_off" | "set_humidity";
  value?: string; // สำหรับ set_humidity
  startTime?: string;
  stopTime?: string;
  enabled?: boolean;
}

// Helper: สร้างตัวเลข 00-23 และ 00-59
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export default function ControlPage() {
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string>('');
  
  // สถานะการควบคุมหลัก
  const [isFanOn, setIsFanOn] = useState(false); 
  const [isMotorOn, setIsMotorOn] = useState(false); 
  const [isAutoMode, setIsAutoMode] = useState(false); 
  
  // สถานะความชื้นเป้าหมาย
  const [targetHumidity, setTargetHumidity] = useState(60); 
  
  // State สำหรับตั้งเวลา
  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin]   = useState("00");
  const [stopHour, setStopHour]   = useState("17");
  const [stopMin, setStopMin]     = useState("00");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(true);

  // ฟังก์ชันยิง API
  const callApi = useCallback(async (payload: ApiPayload) => {
    setLoading(true);
    setApiMessage(''); 
    
    console.log("Sending API Payload:", payload);

    try {
      const res = await fetch("/api/control", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setApiMessage(`Error: ${data.error || "เกิดข้อผิดพลาด"}`);
        throw new Error(data.error || "API call failed");
      }

      // อัปเดตสถานะ Local เมื่อ API ตอบกลับสำเร็จ
      if (payload.type === "command" && payload.command) {
        switch(payload.command) {
          case 'fan_on': setIsFanOn(true); setIsAutoMode(false); break;
          case 'fan_off': setIsFanOn(false); setIsAutoMode(false); break;
          case 'motor_on': setIsMotorOn(true); setIsAutoMode(false); break;
          case 'motor_off': setIsMotorOn(false); setIsAutoMode(false); break;
          case 'auto_on': setIsAutoMode(true); setIsFanOn(false); setIsMotorOn(false); break;
          case 'auto_off': setIsAutoMode(false); break;
          case 'set_humidity': setTargetHumidity(parseInt(payload.value || '0')); break;
        }
        setApiMessage(`✅ สำเร็จ: ${data.message || 'ส่งคำสั่งแล้ว'}`);

      } else if (payload.type === "schedule") {
        setApiMessage(`✅ บันทึกเวลา: ${payload.startTime} - ${payload.stopTime}`);
      }

    } catch (err) {
      console.error("API Call Failed:", err);
      if (!apiMessage.startsWith("Error:")) { 
        setApiMessage("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } finally {
      setLoading(false);
    }
  }, [apiMessage]);

  // 1. ส่งคำสั่ง Manual Command
  const handleCommand = (device: "fan" | "motor" | "auto") => {
    let command: ApiPayload['command'];
    let newState = false;
    
    if (device === "fan") {
      newState = !isFanOn;
      command = newState ? "fan_on" : "fan_off";
    } else if (device === "motor") {
      newState = !isMotorOn;
      command = newState ? "motor_on" : "motor_off";
    } else if (device === "auto") {
      newState = !isAutoMode;
      command = newState ? "auto_on" : "auto_off";
    } else {
      return; 
    }

    callApi({ type: "command", command: command });
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
  };
  
  // 3. บันทึกความชื้น
  const handleSaveHumidity = () => {
    if (targetHumidity < 0 || targetHumidity > 100) {
        setApiMessage("Error: ค่าความชื้นต้องอยู่ระหว่าง 0-100");
        return;
    }

    callApi({
        type: "command",
        command: "set_humidity",
        value: targetHumidity.toString() 
    });
  }

  return (
    <div className="py-10 px-4 font-sans flex justify-center bg-slate-50 min-h-screen">
      
      <div className="w-full max-w-lg space-y-6">
        
        {/* --- Header --- */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-green-100 p-3 rounded-full mb-3 shadow-sm">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Smart Humidifier</h1>
          <p className="text-slate-500 mt-1">ระบบควบคุมความชื้นอัจฉริยะ</p>
        </div>

        {/* API Message Feedback */}
        {apiMessage && (
          <div className={`p-3 rounded-xl text-center font-medium text-sm transition-all ${apiMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {apiMessage}
          </div>
        )}

        {/* --- Card 1: Manual Control --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Power className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-700">สั่งงานทันที (Manual)</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            
            {/* ปุ่มพัดลม (Fan) */}
            <button
              onClick={() => handleCommand("fan")} 
              disabled={loading || isAutoMode}
              className={`flex flex-col items-center justify-center py-4 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isFanOn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Wind className={`w-6 h-6 mb-1 ${isFanOn ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm">{isFanOn ? 'ปิดพัดลม' : 'เปิดพัดลม'}</span>
            </button>
            
            {/* ปุ่มไอน้ำ (Motor) */}
            <button
              onClick={() => handleCommand("motor")}
              disabled={loading || isAutoMode}
              className={`flex flex-col items-center justify-center py-4 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isMotorOn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Droplets className={`w-6 h-6 mb-1 ${isMotorOn ? 'animate-bounce' : ''}`} />
              <span className="font-semibold text-sm">{isMotorOn ? 'ปิดไอน้ำ' : 'เปิดไอน้ำ'}</span>
            </button>

            {/* ปุ่ม Auto */}
            <button
              onClick={() => handleCommand("auto")}
              disabled={loading}
              className={`flex flex-col items-center justify-center py-4 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-50 ${
                  isAutoMode ? 'bg-green-700 hover:bg-green-800' : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              <RefreshCw className={`w-6 h-6 mb-1 ${isAutoMode ? 'animate-spin' : ''}`} />
              <span className="font-semibold text-sm">{isAutoMode ? 'ปิด Auto' : 'โหมด Auto'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">
            {isAutoMode 
                ? 'ระบบทำงานอัตโนมัติ | Manual ถูกปิดใช้งาน' 
                : '*กดปุ่มเพื่อสั่งงานทันที (Manual)'}
          </p>
        </div>
        
        {/* --- Card 3: Target Humidity --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Zap className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-slate-700">🎯 ความชื้นเป้าหมาย</h2>
          </div>

          <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl shadow-inner mb-4">
            <label className="text-base font-medium text-slate-700">ต้องการ (% RH)</label>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    min="0" max="100"
                    value={targetHumidity} 
                    onChange={(e) => setTargetHumidity(parseInt(e.target.value) || 0)}
                    className="w-20 p-2 text-lg text-center font-bold border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-slate-900"
                />
                <span className="text-xl text-slate-700 font-bold">%</span>
            </div>
          </div>
          
          <button
            onClick={handleSaveHumidity}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            <span>บันทึกค่าความชื้น</span>
          </button>
        </div>

        {/* --- Card 2: Schedule Settings --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-700">ตั้งเวลาทำงาน</h2>
            </div>
            
            {/* Toggle Switch */}
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
                {isScheduleEnabled ? 'เปิด' : 'ปิด'}
              </span>
            </label>
          </div>

          <div className={`space-y-4 transition-opacity ${isScheduleEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            
            {/* Start Time */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-slate-600">เริ่มทำงาน</span>
              <div className="flex items-center gap-1">
                <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="bg-white border p-1 rounded font-bold text-slate-800">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <span className="font-bold">:</span>
                <select value={startMin} onChange={(e) => setStartMin(e.target.value)} className="bg-white border p-1 rounded font-bold text-slate-800">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <span className="text-xs text-slate-400 ml-1">น.</span>
              </div>
            </div>

            {/* Stop Time */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-slate-600">หยุดทำงาน</span>
              <div className="flex items-center gap-1">
                <select value={stopHour} onChange={(e) => setStopHour(e.target.value)} className="bg-white border p-1 rounded font-bold text-slate-800">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <span className="font-bold">:</span>
                <select value={stopMin} onChange={(e) => setStopMin(e.target.value)} className="bg-white border p-1 rounded font-bold text-slate-800">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <span className="text-xs text-slate-400 ml-1">น.</span>
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70"
            >
              <Save className="w-5 h-5" />
              <span>บันทึกเวลา</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}