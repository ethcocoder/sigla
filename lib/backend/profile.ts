import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import type { UserProfile, UserStatus } from "@/types/domain";
import { firestore } from "@/lib/firebase";
import { toIso } from "./firestore-helpers";

export async function getCurrentProfile(
  userId: string,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(firestore, "users", userId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "SIGLA member",
    phone: data.phone ?? "",
    role: data.role ?? "USER",
    status: data.status ?? "REGISTERED",
    locationLabel: data.locationLabel,
    avatarUrl: data.avatarUrl,
  };
}

export function subscribeCurrentProfile(
  userId: string,
  onChange: (profile: UserProfile | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    doc(firestore, "users", userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      const data = snapshot.data();
      onChange({
        id: snapshot.id,
        name: data.name ?? "SIGLA member",
        phone: data.phone ?? "",
        role: data.role ?? "USER",
        status: data.status ?? "REGISTERED",
        locationLabel: data.locationLabel,
        avatarUrl: data.avatarUrl,
      });
    },
    (cause) => onError(cause instanceof Error ? cause : new Error("Unable to watch profile.")),
  );
}

function timestamp(value: any) {
  return value?.toMillis?.() ?? (value ? new Date(value).getTime() : 0);
}
export async function listUserPosts(userId: string) {
  const snapshot = await getDocs(
    query(collection(firestore, "posts"), where("userId", "==", userId)),
  );
  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
      createdAt: toIso(item.data().createdAt),
      expiresAt: item.data().expiresAt ? toIso(item.data().expiresAt) : null,
    }))
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
    .slice(0, 50);
}

export function subscribeUserPosts(
  userId: string,
  onChange: (posts: any[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(firestore, "posts"), where("userId", "==", userId)),
    (snapshot) => {
      const posts = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
          createdAt: toIso(item.data().createdAt),
          expiresAt: item.data().expiresAt ? toIso(item.data().expiresAt) : null,
        }))
        .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
        .slice(0, 50);
      onChange(posts);
    },
    (cause) => onError(cause instanceof Error ? cause : new Error("Unable to watch your listings.")),
  );
}

export async function listUserPayments(userId: string) {
  const snapshot = await getDocs(
    query(collection(firestore, "payments"), where("userId", "==", userId)),
  );
  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
      submittedAt: toIso(item.data().submittedAt),
      updatedAt: item.data().updatedAt ? toIso(item.data().updatedAt) : null,
    }))
    .sort((a, b) => timestamp(b.submittedAt) - timestamp(a.submittedAt))
    .slice(0, 50);
}
export function statusLabel(status: UserStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^| )\S/g, (value) => value.toUpperCase());
}
