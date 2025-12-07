import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-center selection:bg-cyan-500 selection:text-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center space-y-4 animate-fade-in-up px-6">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-400 backdrop-blur-xl mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          SYSTEM ONLINE
        </div>

        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          SMART
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            HUMIDITY
          </span>
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-400 font-light tracking-widest uppercase max-w-lg">
          Automated Control
        </p>

        {/* ส่วนปุ่มกด: ปรับเป็น Flex เพื่อวางคู่กัน */}
        <div className="pt-12 flex flex-col md:flex-row gap-6">
          
          {/* ปุ่มเดิม: Control Center */}
          <Link
            href="/control"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-transparent border border-white/10 rounded-full hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black w-64"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
            <span className="relative flex items-center gap-3">
              CONTROL CENTER
              <svg
                className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </Link>

          {/* ปุ่มใหม่: Dashboard */}
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-transparent border border-white/10 rounded-full hover:border-purple-500/50 hover:bg-purple-500/10 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black w-64"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
            <span className="relative flex items-center gap-3">
              DASHBOARD
              {/* เปลี่ยนไอคอนเป็นรูปกราฟเพื่อให้ต่างกัน */}
              <svg 
                className="w-5 h-5 transition-transform duration-300 transform group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </span>
          </Link>

        </div>
      </div>

      <div className="absolute bottom-8 text-xs text-gray-600 font-mono tracking-widest">
        W.A.N.G.
      </div>

    </main>
  );
}