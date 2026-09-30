import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  MarketplacePost,
  PostContactInfo,
  PostType,
} from "@/types/domain";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { toDate, toIso } from "./firestore-helpers";

export type MarketplaceQuery = {
  limit?: number;
  cursor?: string;
  type?: PostType;
};
export type NewDraftPost = {
  type: PostType;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  locationLabel: string;
  imageUrls: string[];
  contactInfo: PostContactInfo;
};
type FirestorePost = Record<string, any>;
function normalizeContactInfo(input: PostContactInfo): PostContactInfo {
  return {
    phone: input.phone.trim(),
    ...(input.whatsapp?.trim() ? { whatsapp: input.whatsapp.trim() } : {}),
    ...(input.telegram?.trim() ? { telegram: input.telegram.trim() } : {}),
    ...(input.facebook?.trim() ? { facebook: input.facebook.trim() } : {}),
    ...(input.instagram?.trim() ? { instagram: input.instagram.trim() } : {}),
  };
}
function currentUserId() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in before managing listings.");
  return user.uid;
}
function mapPost(id: string, row: FirestorePost): MarketplacePost {
  const createdAt = toDate(row.createdAt);
  return {
    id,
    type: row.type,
    categoryId: row.categoryId ?? "",
    categoryLabel: row.categoryLabel ?? "Other",
    productName: row.productName,
    description: row.description,
    quantity: Number(row.quantity),
    unit: row.unit,
    price: row.price == null ? undefined : Number(row.price),
    priceType: row.priceType ?? "CONTACT",
    locationLabel: row.locationLabel,
    imageUrl: row.imageUrls?.[0] ?? "",
    status: row.status,
    poster: {
      id: row.userId ?? "unknown",
      name: row.posterName || "SIGLA member",
      locationLabel: row.posterLocationLabel ?? row.locationLabel,
    },
    createdAtLabel: createdAt.toLocaleDateString(),
    expiresAt: row.expiresAt ? toIso(row.expiresAt) : undefined,
    contactMethods: ["CALL"],
    contactInfo: row.contactInfo ?? { phone: row.posterPhone ?? "" },
  };
}

export async function createDraftPost(input: NewDraftPost) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in before creating a listing.");
  const contactInfo = normalizeContactInfo(input.contactInfo);
  const ref = await addDoc(collection(firestore, "posts"), {
    userId: user.uid,
    posterName: user.displayName ?? "SIGLA member",
    type: input.type,
    categoryLabel: "Other",
    productName: input.productName.trim(),
    description: input.description.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
    locationLabel: input.locationLabel.trim(),
    imageUrls: input.imageUrls,
    contactInfo,
    posterPhone: contactInfo.phone,
    priceType: "CONTACT",
    status: "DRAFT",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
export async function updateDraftPost(id: string, input: NewDraftPost) {
  const userId = currentUserId();
  const contactInfo = normalizeContactInfo(input.contactInfo);
  await updateDoc(doc(firestore, "posts", id), {
    userId,
    type: input.type,
    productName: input.productName.trim(),
    description: input.description.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
    locationLabel: input.locationLabel.trim(),
    imageUrls: input.imageUrls,
    contactInfo,
    posterPhone: contactInfo.phone,
    status: "DRAFT",
    rejectionReason: null,
    updatedAt: serverTimestamp(),
  });
}
export async function deleteUserPost(id: string) {
  await deleteDoc(doc(firestore, "posts", id));
}
export async function publishAdminPost(id: string, adminId: string) {
  await updateDoc(doc(firestore, "posts", id), {
    status: "APPROVED",
    approvedBy: adminId,
    approvedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function submitPostForApproval(id: string) {
  await updateDoc(doc(firestore, "posts", id), {
    status: "PENDING_REVIEW",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function markPostPaymentPending(postId: string) {
  await updateDoc(doc(firestore, "posts", postId), {
    status: "PAYMENT_PENDING",
    updatedAt: serverTimestamp(),
  });
}
export async function listApprovedPosts(
  queryOptions: MarketplaceQuery = {},
): Promise<MarketplacePost[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, "posts"),
      where("status", "==", "APPROVED"),
      limit(50),
    ),
  );
  return snapshot.docs
    .map((item) => mapPost(item.id, item.data()))
    .filter((item) => !queryOptions.type || item.type === queryOptions.type)
    .sort((a, b) => b.createdAtLabel.localeCompare(a.createdAtLabel))
    .slice(0, Math.min(queryOptions.limit ?? 12, 50));
}
export async function getPostById(id: string): Promise<MarketplacePost | null> {
  const snapshot = await getDoc(doc(firestore, "posts", id));
  return snapshot.exists() ? mapPost(snapshot.id, snapshot.data()) : null;
}
