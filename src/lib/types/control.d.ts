export type ModeType = "manual" | "auto" | "off";

export interface ManualPayload {
  type: "manual";
  manual_state: boolean;
}

export interface ModePayload {
  type: "mode";
  mode: ModeType;
}

export interface SchedulePayload {
  type: "schedule";
  enabled: boolean;
  sched_start?: string;
  sched_end?: string;
}

export type ControlPayload =
  | ManualPayload
  | ModePayload
  | SchedulePayload;

export interface ApiResponse {
  ok: boolean;
  message?: string;
  error?: string;
}
