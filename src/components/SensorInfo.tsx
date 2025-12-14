"use client";

import SensorCard from "./SensorCard";
import { Thermometer, Droplets, Battery, Compass, ToggleRight } from "lucide-react";
import type { SensorData } from "@/lib/types/sensor";

interface SensorInfoProps {
  data: SensorData;
}

export default function SensorInfo({ data }: SensorInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SensorCard
        title="Temperature"
        value={data.env.temperature ?? "--"}
        icon={<Thermometer className="w-7 h-7 text-blue-600" />}
        unit="°C"
      />

      <SensorCard
        title="Humidity"
        value={data.env.humidity ?? "--"}
        icon={<Droplets className="w-7 h-7 text-blue-600" />}
        unit="%"
      />

      <SensorCard
        title="Water Level"
        value={data.water.percent ?? "--"}
        icon={<Battery className="w-7 h-7 text-blue-600" />}
        unit="%"
      />

      <SensorCard
        title="Tilt State"
        value={data.tilt.state_text ?? "--"}
        icon={<Compass className="w-7 h-7 text-blue-600" />}
        unit=""
      />
      
    </div>
  );
}
