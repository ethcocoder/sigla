import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import type { UserProfile, UserStatus } from "@/types/domain";
import { firestore } from "@/lib/firebase";
import { toIso } from "./firestore-helpers";

export async function getCurrentProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(firestore, "users", userId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return { id: snapshot.id, name: data.name ?? "SIGLA member", phone: data.phone ?? "", role: data.role ?? "USER", status: data.status ?? "REGISTERED", locationLabel: data.locationLabel, avatarUrl: data.avatarUrl };
}

export async function listUserPosts(userId: string) {
  const snapshot = await getDocs(query(collection(firestore, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc")));
  return snapshot.docs.slice(0, 50).map((item) => ({ id: item.id, ...item.data(), createdAt: toIso(item.data().createdAt), expiresAt: item.data().expiresAt ? toIso(item.data().expiresAt) : null }));
}

export async function listUserPayments(userId: string) {
  const snapshot = await getDocs(query(collection(firestore, "payments"), where("userId", "==", userId), orderBy("submittedAt", "desc")));
  return snapshot.docs.slice(0, 50).map((item) => ({ id: item.id, ...item.data(), submittedAt: toIso(item.data().submittedAt), updatedAt: item.data().updatedAt ? toIso(item.data().updatedAt) : null }));
}

export function statusLabel(status: UserStatus) { return status.replaceAll("_", " ").toLowerCase().replace(/(^| )\S/g, (value) => value.toUpperCase()); }
