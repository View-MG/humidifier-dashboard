// src/models/SpeechLog.ts
import mongoose, { Schema, models, model } from "mongoose";

const SpeechLogSchema = new Schema(
  {
    text: { type: String, required: true },       // ข้อความที่ได้จาก Whisper ฯลฯ
    procTime: { type: Number, required: false },  // เวลาในการประมวลผล (วินาที)

    // ระบุแหล่งที่มา เผื่อมีหลาย device / client
    nodeId: { type: Number, required: false },
    clientId: { type: String, required: false },

    // เผื่ออนาคตมีการ detect intent เช่น "TURN_FAN_ON"
    intent: { type: String, required: false },
    confidence: { type: Number, required: false },

    // ใช้ Date แทน timestamp แบบตัวเลข
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const SpeechLog = models.SpeechLog || model("SpeechLog", SpeechLogSchema);
export default SpeechLog;
