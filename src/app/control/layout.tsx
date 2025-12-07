"use client";

import { useState } from "react";
import { Chakra_Petch } from "next/font/google";
import { ChevronRight, X, Activity, Cpu } from "lucide-react";
import SensorSidebar from '../../components/SensorSidebar';

const chakra = Chakra_Petch({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-[#020617] text-blue-50 relative overflow-x-hidden ${chakra.className}`}>
      
      {/* 1. Background Effects (เหมือนเดิมเพื่อให้ต่อเนื่อง) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.07)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_20%)]" />
      </div>

      {/* 2. Toggle Button (ปุ่มเรียก Sidebar) */}
      {/* ปุ่มนี้จะลอยอยู่ซ้ายมือตลอดเวลา เหมือนสลักประตูกล */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-0 top-32 z-40 flex items-center gap-2 bg-blue-600/20 border-y border-r border-blue-500/50 hover:bg-blue-600/40 backdrop-blur-sm text-blue-100 py-3 pl-2 pr-4 rounded-r-lg transition-all duration-300 group ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex flex-col gap-1">
           <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
           <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
           <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
        </div>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        <span className="text-xs font-bold tracking-widest writing-vertical-lr hidden md:block">
          SENSORS
        </span>
      </button>

      {/* 3. Overlay (ฉากหลังมืดๆ เวลากดเปิด) */}
      {/* คลิกที่ว่างเพื่อปิดได้ */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* 4. Sliding Sidebar (ตัวพระเอก) */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-full md:w-[28rem] bg-slate-900/90 border-r border-blue-500/30 shadow-[10px_0_50px_-10px_rgba(0,0,0,0.9)] transform transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1) ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Decorative Header inside Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-transparent">
            <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-blue-100 tracking-wider font-bold text-lg">SENSOR FEED</span>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar p-4 relative">
             {/* เส้น Tech วิ่งๆ ด้านข้าง */}
             <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-600/50 to-transparent opacity-50"></div>
             
             {/* เรียก Component เดิมมาแสดง */}
             <SensorSidebar />
        </div>
      </aside>

      {/* 5. Main Content Area */}
      <main className="relative z-10 w-full min-h-screen transition-all duration-300">
        
        {/* Header Decor ของหน้า Control */}
        <div className="h-20 flex items-end justify-end px-8 pb-4 border-b border-white/5">
             <div className="text-right">
                <h1 className="text-3xl font-black italic tracking-widest text-white/90 uppercase drop-shadow-lg">
                    Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Center</span>
                </h1>
                <div className="flex justify-end gap-2 text-[10px] text-gray-500 font-mono mt-1">
                   <span>SEC-CODE: A113</span>
                   <span className="text-blue-500">///</span>
                   <span>SYSTEM: READY</span>
                </div>
             </div>
        </div>

        {/* เนื้อหาหลัก (Control Page) */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
        </div>
      </main>

    </div>
  );
}