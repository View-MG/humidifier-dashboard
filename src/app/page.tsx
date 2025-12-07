import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center text-center">
        {/* ข้อความหลัก */}
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
          SMART HUMIDITY
        </h1>

        {/* ข้อความรอง */}
        <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
          welcome
        </p>

        {/* กลุ่มปุ่มกด 3 ปุ่ม */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          
          {/* ปุ่มไปหน้า Logs */}
          <Link
            href="/logs"
            className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Logs
          </Link>

          {/* ปุ่มไปหน้า Control Device */}
          <Link
            href="/control"
            className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Control Device
          </Link>

          {/* ปุ่มไปหน้า Dashboard */}
          <Link
            href="/dashboard"
            className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Dashboard
          </Link>
          
        </div>
      </main>
    </div>
  );
}