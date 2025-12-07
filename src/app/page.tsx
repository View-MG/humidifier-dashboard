import Link from "next/link";

export default function Home() {
  return (
    // ใช้ bg-neutral-950 เพื่อความดำที่ดูลึกและสุขุม (Sophisticated dark background)
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center">

      {/* Container สำหรับข้อความตรงกลาง */}
      <div className="flex flex-col items-center space-y-2 animate-fade-in-up">
        {/* หัวข้อหลัก SMART HUMIDITY */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 drop-shadow-sm">
          SMART HUMIDITY
        </h1>

        {/* คำรอง welcome */}
        <p className="text-lg md:text-xl text-neutral-500 font-light uppercase tracking-[0.3em]">
          welcome
        </p>
      </div>

      {/* Container สำหรับปุ่ม */}
      <div className="mt-16 animate-fade-in-up delay-200">
        <Link
          href="/control"
          // สไตล์ปุ่มแบบเรียบหรู เข้มๆ มี interaction เมื่อ hover
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-neutral-800 px-8 py-4 font-medium text-neutral-200 transition-all duration-300 hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          <span className="text-lg">Control Device</span>
          {/* ไอคอนลูกศรเล็กๆ ที่ขยับเมื่อ hover */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

    </main>
  );
}