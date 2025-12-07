// src/lib/types/control.d.ts (หรือ speech.d.ts ก็ได้)
import type { TimestampFilter } from "@/lib/types/sensor"; // reuse ได้

export interface SpeechLogFilter {
  timestamp?: TimestampFilter;
  nodeId?: number;
  text?: {
    $regex: string;
    $options: string;
  };
}

export interface SpeechLogPayload {
  text: string;
  procTime?: number;
  nodeId?: number;
  clientId?: string;
  intent?: string;
  confidence?: number;
  timestamp?: Date;
}
