import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ?? "/home/ubuntu/upload/sigla-1e1cf-firebase-adminsdk-fbsvc-0850f2f1d6.json";
const adminEmail = "sigla@org.com";
const adminPassword = "12345678@";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);
const db = getFirestore(app);

async function ensureAdmin(): Promise<UserRecord> {
  let user: UserRecord;
  try {
    user = await auth.getUserByEmail(adminEmail);
    user = await auth.updateUser(user.uid, { password: adminPassword, displayName: "SIGLA Administrator", emailVerified: true });
  } catch (error: any) {
    if (error?.code !== "auth/user-not-found") throw error;
    user = await auth.createUser({ email: adminEmail, password: adminPassword, displayName: "SIGLA Administrator", emailVerified: true });
  }
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true });
  return user;
}

const now = FieldValue.serverTimestamp();
const fixedDate = new Date("2026-09-29T23:00:00.000Z");

async function seed() {
  const admin = await ensureAdmin();
  const batch = db.batch();
  const userRef = db.collection("users").doc(admin.uid);
  batch.set(userRef, { id: admin.uid, email: adminEmail, name: "SIGLA Administrator", phone: "+251911000000", role: "ADMIN", status: "ACTIVE", locationLabel: "Addis Ababa", createdAt: fixedDate, updatedAt: now }, { merge: true });

  const memberOneId = "seed-member-001";
  const memberTwoId = "seed-member-002";
  batch.set(db.collection("users").doc(memberOneId), { id: memberOneId, email: "farmer@example.com", name: "Alemu Farm", phone: "+251911111111", role: "USER", status: "ACTIVE", locationLabel: "Bishoftu", createdAt: fixedDate, updatedAt: now }, { merge: true });
  batch.set(db.collection("users").doc(memberTwoId), { id: memberTwoId, email: "buyer@example.com", name: "Mekdes Trading", phone: "+251922222222", role: "USER", status: "ACTIVE", locationLabel: "Addis Ababa", createdAt: fixedDate, updatedAt: now }, { merge: true });

  batch.set(db.collection("settings").doc("platform"), { appNameEn: "SIGLA", appNameAm: "ሲግላ", registrationFee: 100, postFee: 50, telebirrNumber: "0911000000", maxPostsPerDay: 10, maxImagesPerPost: 1, postExpirationDays: 30, allowNewRegistrations: true, requirePostApproval: true, requireUserApproval: true, supportPhone: "+251911000000", supportTelegram: "@sigla_support", updatedAt: now }, { merge: true });

  batch.set(db.collection("posts").doc("seed-post-approved"), { userId: memberOneId, posterName: "Alemu Farm", posterLocationLabel: "Bishoftu", type: "HAVE", categoryId: "grains", categoryLabel: "Grains", productName: "Wheat", description: "Fresh wheat available for wholesale buyers.", quantity: 120, unit: "quintals", price: 6500, priceType: "NEGOTIABLE", locationLabel: "Bishoftu", imageUrls: [], status: "APPROVED", createdAt: fixedDate, approvedBy: admin.uid, approvedAt: fixedDate }, { merge: true });
  batch.set(db.collection("posts").doc("seed-post-review"), { userId: memberTwoId, posterName: "Mekdes Trading", posterLocationLabel: "Addis Ababa", type: "NEED", categoryId: "fertilizer", categoryLabel: "Inputs", productName: "Urea fertilizer", description: "Looking for reliable urea fertilizer suppliers.", quantity: 80, unit: "bags", locationLabel: "Addis Ababa", imageUrls: [], priceType: "CONTACT", status: "PENDING_REVIEW", createdAt: new Date("2026-09-29T23:05:00.000Z") }, { merge: true });
  batch.set(db.collection("posts").doc("seed-post-draft"), { userId: memberOneId, posterName: "Alemu Farm", posterLocationLabel: "Bishoftu", type: "HAVE", categoryLabel: "Other", productName: "Teff straw", description: "Good quality teff straw for livestock feed.", quantity: 40, unit: "bundles", locationLabel: "Bishoftu", imageUrls: [], priceType: "CONTACT", status: "DRAFT", createdAt: new Date("2026-09-29T23:10:00.000Z") }, { merge: true });

  batch.set(db.collection("payments").doc("seed-payment-pending"), { userId: memberTwoId, type: "REGISTRATION", amount: 100, transactionReference: "TEL-SEED-001", senderPhone: "+251922222222", status: "PENDING", submittedAt: new Date("2026-09-29T23:06:00.000Z"), updatedAt: now }, { merge: true });
  batch.set(db.collection("payments").doc("seed-payment-verified"), { userId: memberOneId, postId: "seed-post-approved", type: "POST", amount: 50, transactionReference: "TEL-SEED-002", senderPhone: "+251911111111", status: "VERIFIED", submittedAt: new Date("2026-09-29T22:00:00.000Z"), verifiedBy: admin.uid, verifiedAt: fixedDate, updatedAt: now }, { merge: true });

  batch.set(db.collection("notifications").doc("seed-notification-admin"), { userId: admin.uid, type: "ANNOUNCEMENT", title: "Welcome to SIGLA", body: "The SIGLA administrator workspace is ready.", createdAt: fixedDate, readAt: null }, { merge: true });
  batch.set(db.collection("notifications").doc("seed-notification-member"), { userId: memberTwoId, type: "PAYMENT", title: "Payment submitted", body: "Your registration payment is waiting for administrator review.", createdAt: new Date("2026-09-29T23:07:00.000Z"), readAt: null }, { merge: true });

  await batch.commit();
  console.log(JSON.stringify({ projectId: serviceAccount.project_id, adminEmail, adminUid: admin.uid, seededCollections: ["users", "settings", "posts", "payments", "notifications"], seededDocuments: 11 }, null, 2));
}

void seed().catch((error) => { console.error(error); process.exitCode = 1; });
