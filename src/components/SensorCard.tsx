"use client";

import { ReactNode } from "react";

interface SensorCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  unit?: string;
}

export default function SensorCard({ title, value, icon, unit }: SensorCardProps) {
  return (
    <div className="flex items-center p-5 rounded-xl shadow-md bg-white/90 border font border-gray-200 backdrop-blur-sm hover:shadow-lg transition">
      <div className="text-3xl mr-4 text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-black">
          {value} {unit && <span className="text-black text-lg">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
