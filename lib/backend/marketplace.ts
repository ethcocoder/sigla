import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import type { MarketplacePost, PostType } from "@/types/domain";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { toDate, toIso } from "./firestore-helpers";

export type MarketplaceQuery = { limit?: number; cursor?: string; type?: PostType };
export type NewDraftPost = { type: PostType; productName: string; description: string; quantity: number; unit: string; locationLabel: string; imageUrls: string[] };

type FirestorePost = Record<string, any>;
function mapPost(id: string, row: FirestorePost): MarketplacePost {
  const createdAt = toDate(row.createdAt);
  return { id, type: row.type, categoryId: row.categoryId ?? "", categoryLabel: row.categoryLabel ?? "Other", productName: row.productName, description: row.description, quantity: Number(row.quantity), unit: row.unit, price: row.price == null ? undefined : Number(row.price), priceType: row.priceType ?? "CONTACT", locationLabel: row.locationLabel, imageUrl: row.imageUrls?.[0] ?? "", status: row.status, poster: { id: row.userId ?? "unknown", name: row.posterName || "SIGLA member", locationLabel: row.posterLocationLabel ?? row.locationLabel }, createdAtLabel: createdAt.toLocaleDateString(), expiresAt: row.expiresAt ? toIso(row.expiresAt) : undefined, contactMethods: ["CALL"] };
}

export async function createDraftPost(input: NewDraftPost) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in before creating a listing.");
  const ref = await addDoc(collection(firestore, "posts"), { userId: user.uid, posterName: user.displayName ?? "SIGLA member", type: input.type, categoryLabel: "Other", productName: input.productName.trim(), description: input.description.trim(), quantity: input.quantity, unit: input.unit.trim(), locationLabel: input.locationLabel.trim(), imageUrls: input.imageUrls, priceType: "CONTACT", status: "DRAFT", createdAt: serverTimestamp() });
  return ref.id;
}

export async function markPostPaymentPending(postId: string) { await updateDoc(doc(firestore, "posts", postId), { status: "PAYMENT_PENDING", updatedAt: serverTimestamp() }); }

export async function listApprovedPosts(queryOptions: MarketplaceQuery = {}): Promise<MarketplacePost[]> {
  const snapshot = await getDocs(query(collection(firestore, "posts"), where("status", "==", "APPROVED"), orderBy("createdAt", "desc"), limit(Math.min(queryOptions.limit ?? 12, 50))));
  return snapshot.docs.map((item) => mapPost(item.id, item.data())).filter((item) => !queryOptions.type || item.type === queryOptions.type);
}

export async function getPostById(id: string): Promise<MarketplacePost | null> {
  const snapshot = await getDoc(doc(firestore, "posts", id));
  return snapshot.exists() ? mapPost(snapshot.id, snapshot.data()) : null;
}
