import SensorSidebar from '../../components/SensorSidebar';

// Layout นี้จะครอบคลุมเฉพาะหน้า /control
export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* LEFT SIDE: Sensor Data Display (Sidebar) */}
      <aside className="w-[30rem] min-h-screen bg-gray-100 shadow-2xl border-r border-gray-300 sticky top-0 overflow-y-auto">
        <SensorSidebar /> 
      </aside>

      {/* RIGHT SIDE: Main Content (ControlPage) */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}