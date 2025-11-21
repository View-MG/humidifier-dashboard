"use client";

import SensorCard from "./SensorCard";
import { Thermometer, Droplets, Battery, Compass, ToggleRight } from "lucide-react";

interface SensorInfoProps {
  data: SensorData;
}

export default function SensorInfo({ data }: SensorInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SensorCard
        title="Temperature"
        value={data.temp ?? "--"}
        icon={<Thermometer className="w-7 h-7 text-blue-600" />}
        unit="°C"
      />

      <SensorCard
        title="Humidity"
        value={data.humidity ?? "--"}
        icon={<Droplets className="w-7 h-7 text-blue-600" />}
        unit="%"
      />

      <SensorCard
        title="Water Level"
        value={data.water ?? "--"}
        icon={<Battery className="w-7 h-7 text-blue-600" />}
        unit="%"
      />

      <SensorCard
        title="Tilt Angle"
        value={data.tilt ?? "--"}
        icon={<Compass className="w-7 h-7 text-blue-600" />}
        unit="°"
      />

      <SensorCard
        title="Button Status"
        value={data.button ? "Pressed" : "Released"}
        icon={<ToggleRight className="w-7 h-7 text-blue-600" />}
      />
    </div>
  );
}
