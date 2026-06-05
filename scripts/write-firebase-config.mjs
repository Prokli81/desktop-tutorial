import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const required = ["FIREBASE_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_APP_ID"];

for (const key of required) {
  if (!process.env[key]) {
    console.log(`Skip Firebase config injection: missing ${key}`);
    process.exit(0);
  }
}

const config = `/**
 * Автогенерация из GitHub Secrets при деплое.
 */
window.MYFITCLUB_FIREBASE_CONFIG = {
  enabled: true,
  apiKey: "${process.env.FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`}",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ""}",
  vapidKey: "${process.env.FIREBASE_VAPID_KEY || ""}",
  appId: "${process.env.FIREBASE_APP_ID}",
};
`;

const target = resolve("MyFitClub/firebase-config.js");
writeFileSync(target, config);
console.log(`Wrote ${target}`);
