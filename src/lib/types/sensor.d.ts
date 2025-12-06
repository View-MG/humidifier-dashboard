// src/lib/types/sensor.d.ts

export interface TimestampFilter {
  $gte?: Date;
  $lte?: Date;
}

export interface SensorLogFilter {
  // filter ด้วยเวลา
  timestamp?: TimestampFilter;

  // filter เพิ่มเติม (แล้วแต่คุณจะมีอะไรอีก)
  nodeId?: number;
}

export interface SensorLogPayload {
  nodeId: number;
  waterRaw?: number;
  waterPercent?: number;
  isTilted?: boolean;
  keyPress?: string | null;
  fanStatus?: boolean;
  steamStatus?: boolean;
  temperature?: number;
  humidity?: number;
  source?: "sensor" | "gateway" | "simulator";
  timestamp?: Date;
}
