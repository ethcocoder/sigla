import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { toDate } from "./firestore-helpers";

export type ConversationSummary = {
  id: string;
  otherUserId: string;
  otherName: string;
  lastMessage: string;
  updatedAt: Date;
  listingName?: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
};

function currentUser() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in before messaging.");
  return user;
}

export function conversationIdForUsers(
  firstUserId: string,
  secondUserId: string,
) {
  return [firstUserId, secondUserId].sort().join("__");
}

export async function getOrCreateConversation(input: {
  otherUserId: string;
  otherName: string;
  listingId?: string;
  listingName?: string;
}) {
  const user = currentUser();
  if (user.uid === input.otherUserId)
    throw new Error("You cannot message your own listing.");
  const id = conversationIdForUsers(user.uid, input.otherUserId);
  await setDoc(
    doc(firestore, "conversations", id),
    {
      participantIds: [user.uid, input.otherUserId],
      participantNames: {
        [user.uid]: user.displayName ?? "SIGLA member",
        [input.otherUserId]: input.otherName || "SIGLA member",
      },
      ...(input.listingId ? { listingId: input.listingId } : {}),
      ...(input.listingName ? { listingName: input.listingName } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return id;
}

export async function listConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, "conversations"),
      where("participantIds", "array-contains", userId),
      limit(50),
    ),
  );
  return snapshot.docs
    .map((item) => {
      const row = item.data();
      const participantIds = (row.participantIds ?? []) as string[];
      const otherUserId = participantIds.find((id) => id !== userId) ?? "";
      return {
        id: item.id,
        otherUserId,
        otherName: row.participantNames?.[otherUserId] ?? "SIGLA member",
        lastMessage: row.lastMessage ?? "Start a conversation",
        updatedAt: toDate(row.updatedAt),
        listingName: row.listingName,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function subscribeToConversations(
  userId: string,
  onChange: (items: ConversationSummary[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(
      collection(firestore, "conversations"),
      where("participantIds", "array-contains", userId),
      limit(50),
    ),
    (snapshot) => {
      const items = snapshot.docs
        .map((item) => {
          const row = item.data();
          const participantIds = (row.participantIds ?? []) as string[];
          const otherUserId = participantIds.find((id) => id !== userId) ?? "";
          return {
            id: item.id,
            otherUserId,
            otherName: row.participantNames?.[otherUserId] ?? "SIGLA member",
            lastMessage: row.lastMessage ?? "Start a conversation",
            updatedAt: toDate(row.updatedAt),
            listingName: row.listingName,
          };
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      onChange(items);
    },
    (cause) => onError(cause instanceof Error ? cause : new Error("Unable to watch conversations.")),
  );
}

export function subscribeToMessages(
  conversationId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void,
) {
  const messagesQuery = query(
    collection(firestore, "conversations", conversationId, "messages"),
    limit(100),
  );
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((item) => {
          const row = item.data();
          return {
            id: item.id,
            senderId: row.senderId,
            text: row.text ?? "",
            createdAt: toDate(row.createdAt),
          };
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      onChange(messages);
    },
    (cause) =>
      onError(
        cause instanceof Error ? cause : new Error("Unable to load messages."),
      ),
  );
}

export async function sendMessage(
  conversationId: string,
  receiverId: string,
  text: string,
) {
  const user = currentUser();
  const cleanText = text.trim();
  if (!cleanText) throw new Error("Write a message first.");
  await addDoc(
    collection(firestore, "conversations", conversationId, "messages"),
    {
      senderId: user.uid,
      receiverId,
      text: cleanText,
      createdAt: serverTimestamp(),
    },
  );
  await setDoc(
    doc(firestore, "conversations", conversationId),
    { lastMessage: cleanText, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
