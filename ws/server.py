import asyncio
import websockets
import numpy as np
from faster_whisper import WhisperModel
import time

# ---------- FIREBASE ----------
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://embedded-curtain-project-default-rtdb.asia-southeast1.firebasedatabase.app/"
})
# ------------------------------

# --- CONFIG ---
PORT = 4000
SAMPLE_RATE = 16000
SILENCE_THRESHOLD = 500
MIN_RECORD_SECONDS = 1.0
MAX_RECORD_SECONDS = 10.0
SILENCE_DURATION = 1.0

# --- Load Model ---
print("⏳ Loading Model... (รอสักครู่)")
model = WhisperModel("tiny", device="cpu", compute_type="int8")
print("✅ Model Loaded! Ready to receive audio.")

async def audio_handler(websocket):
    print(f"🎤 ESP32 Connected from {websocket.remote_address}")
    
    audio_buffer = bytearray()
    silence_start_time = None
    is_speaking = False
    
    try:
        async for message in websocket:
            audio_buffer.extend(message)
            chunk_data = np.frombuffer(message, dtype=np.int16)
            
            if len(chunk_data) > 0:
                amplitude = np.mean(np.abs(chunk_data))
            else:
                amplitude = 0

            current_time = time.time()
            buffer_duration = len(audio_buffer) / (SAMPLE_RATE * 2)

            if amplitude > SILENCE_THRESHOLD:
                is_speaking = True
                silence_start_time = None
            else:
                if silence_start_time is None:
                    silence_start_time = current_time
            
            should_transcribe = False
            
            if is_speaking and silence_start_time and (current_time - silence_start_time > SILENCE_DURATION):
                if buffer_duration >= MIN_RECORD_SECONDS:
                    should_transcribe = True
                    print(f"✂️ Silence Detected ({buffer_duration:.2f}s)")
            
            if buffer_duration >= MAX_RECORD_SECONDS:
                should_transcribe = True
                print("⚠️ Force Cut (Max Limit)")

            if should_transcribe:
                process_buffer = np.frombuffer(audio_buffer, dtype=np.int16).astype(np.float32) / 32768.0
                
                audio_buffer = bytearray()
                is_speaking = False
                silence_start_time = None
                
                start_proc = time.time()
                
                segments, info = model.transcribe(process_buffer, language="en", beam_size=1)
                text = " ".join([segment.text for segment in segments]).strip()
                proc_time = time.time() - start_proc

                text_lower = text.lower()
                ignore_words = ["subtitles", "watching", "mbc", "amara", "copyright"]
                is_noise = any(word in text_lower for word in ignore_words)

                if text and not is_noise:
                    print(f"✅ Talk: {text} (Time: {proc_time:.2f}s)")

                    # ---------- อัปขึ้น Realtime Database (เฉพาะค่า latest) ----------
                    ts_ms = int(time.time() * 1000)

                    latest_ref = db.reference("speech_latest")
                    latest_ref.set({
                        "text": text,
                        "proc_time": proc_time,
                        "timestamp": ts_ms
                    })
                    # ---------------------------------------------------------------

                else:
                    print(f"🔇 (No Speech/Noise)")

    except websockets.exceptions.ConnectionClosed:
        print("🔴 ESP32 Disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")

async def main():
    async with websockets.serve(audio_handler, "0.0.0.0", PORT):
        print(f"🟢 Server Running on ws://0.0.0.0:{PORT}")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
