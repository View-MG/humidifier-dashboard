import { WebSocketServer } from "ws";
import fs from "fs";
import { exec } from "child_process";

const PORT = 4000;  // Next.js default คือ 3000 ไม่ชน
const RATE = 16000;
const SEC_PER_FILE = 4;
const LIMIT = RATE * SEC_PER_FILE * 2;

let buffer = Buffer.alloc(0);

const wss = new WebSocketServer({ port: PORT });
console.log(`🟢 WebSocket Running Port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("🎤 ESP32 Connected");

  ws.on("message", (data) => {
    buffer = Buffer.concat([buffer, data]);

    if (buffer.length >= LIMIT) {
      const t = Date.now();
      const raw = `audio_${t}.raw`;
      const wav = `audio_${t}.wav`;

      const chunk = buffer.subarray(0, LIMIT);
      buffer = buffer.subarray(LIMIT);
      fs.writeFileSync(raw, chunk);

      exec(`ffmpeg -y -f s16le -ar ${RATE} -ac 1 -i ${raw} ${wav}`, (e) => {
        if (!e) {
          console.log(`💾 Saved -> ${wav}`);
          fs.unlinkSync(raw);
        }
      });
    }
  });

  ws.on("close", () => console.log("🔴 ESP32 Disconnected"));
});
