import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import type { NotificationItem } from "@/types/domain";
import { firestore } from "@/lib/firebase";
import { toDate } from "./firestore-helpers";

export async function listNotifications(userId: string): Promise<NotificationItem[]> {
  const snapshot = await getDocs(query(collection(firestore, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50)));
  return snapshot.docs.map((item) => { const row = item.data(); return { id: item.id, title: row.title, body: row.body, kind: row.type, createdAtLabel: toDate(row.createdAt).toLocaleDateString(), read: Boolean(row.readAt) }; });
}
export async function markNotificationRead(id: string) { await updateDoc(doc(firestore, "notifications", id), { readAt: new Date() }); }
