// lib/firebase/firebaseClient.ts
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // ใส่ค่าจาก Firebase Console -> Project Settings -> General -> Web Apps
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL, // <-- ต้องใส่
  projectId: process.env.FB_PROJECT_ID,
  // ... ค่าอื่นๆ
};

// เช็คว่ามี App อยู่แล้วหรือยัง (ป้องกัน Error ตอน Hot Reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { db };