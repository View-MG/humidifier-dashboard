// src/models/ControlLog.ts
import mongoose, { Schema, models, model } from "mongoose";

const ControlLogSchema = new Schema(
  {
    nodeId: { type: Number, required: true, index: true },

    // ที่มาของคำสั่ง
    source: {
      type: String,
      enum: ["auto", "button", "speech", "api"],
      required: true,
    },

    // คำสั่งที่สั่งจริง
    command: {
      type: String,
      enum: ["FAN_ON", "FAN_OFF", "STEAM_ON", "STEAM_OFF"],
      required: true,
    },

    // สถานะก่อนเปลี่ยน
    prevFanStatus: Boolean,
    prevSteamStatus: Boolean,

    // สถานะหลังเปลี่ยน
    newFanStatus: Boolean,
    newSteamStatus: Boolean,

    // สภาพแวดล้อมตอนนั้น (เอามาจาก sensor log)
    humidity: Number,
    temperature: Number,

    // ถ้ามาจาก Speech สามารถโยงไปที่ SpeechLog
    speechRef: { type: Schema.Types.ObjectId, ref: "SpeechLog" },

    reason: { type: String, required: false }, // เช่น "humidity<40 → auto เปิดไอน้ำ"

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const ControlLog = models.ControlLog || model("ControlLog", ControlLogSchema);
export default ControlLog;
