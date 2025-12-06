// src/models/SensorLog.ts
import mongoose, { Schema, models, model } from "mongoose";

const SensorLogSchema = new Schema(
  {
    nodeId: { type: Number, required: true, index: true },

    waterRaw: Number,
    waterPercent: Number,

    isTilted: Boolean,
    keyPress: { type: String, default: null }, // กดปุ่มอะไร ถ้าไม่มีให้ null

    fanStatus: Boolean,   // feedback จริง
    steamStatus: Boolean, // feedback จริง

    temperature: Number,
    humidity: Number,

    // แหล่งที่มา เผื่อมี simulator หรือ manual inject
    source: {
      type: String,
      enum: ["sensor", "gateway", "simulator"],
      default: "sensor",
    },

    // เวลาเก็บเป็น Date ดีกว่า string → แปลงเป็น 10:00:00 + timezone ตอนดึง
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const SensorLog = models.SensorLog || model("SensorLog", SensorLogSchema);
export default SensorLog;
