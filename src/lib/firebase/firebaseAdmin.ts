import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin/app";

if (!admin.apps.length) {
  // 1. แก้ปัญหา Newline ใน Private Key (\n)
  const privateKey = process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // 2. สร้าง Object พร้อมระบุ Type ServiceAccount
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FB_PROJECT_ID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  // 3. Initialize
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FB_DB_URL,
  });
}

export const db = admin.database();