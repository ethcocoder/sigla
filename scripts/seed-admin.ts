import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ?? "/home/ubuntu/upload/sigla-1e1cf-firebase-adminsdk-fbsvc-0850f2f1d6.json";
const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "SIGLA Administrator";
const phone = process.env.ADMIN_PHONE ?? "";
if (!email) throw new Error("Usage: pnpm seed:admin -- admin@example.com (set ADMIN_PASSWORD to create a new account)");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);
const db = getFirestore(app);
let user;
try { user = await auth.getUserByEmail(email); } catch (error: any) { if (error?.code !== "auth/user-not-found" || !password) throw new Error("Admin user does not exist. Set ADMIN_PASSWORD to create it."); user = await auth.createUser({ email, password, displayName: name, phoneNumber: phone || undefined }); }
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true });
await db.collection("users").doc(user.uid).set({ name: user.displayName ?? name, phone: user.phoneNumber ?? phone, role: "ADMIN", status: "ACTIVE", email: user.email ?? email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`Admin ready: ${user.email} (${user.uid})`);
