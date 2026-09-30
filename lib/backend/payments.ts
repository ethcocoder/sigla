import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";

function currentUserId() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Your account session is not ready. Please sign in and try again.");
  return user.uid;
}

export async function submitRegistrationPayment(input: { amount: number; senderPhone: string; transactionReference: string }) {
  await addDoc(collection(firestore, "payments"), { userId: currentUserId(), type: "REGISTRATION", amount: input.amount, transactionReference: input.transactionReference.trim(), senderPhone: input.senderPhone.trim(), status: "PENDING", submittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function submitPostPayment(input: { postId: string; amount: number; senderPhone: string; transactionReference: string }) {
  await addDoc(collection(firestore, "payments"), { userId: currentUserId(), postId: input.postId, type: "POST", amount: input.amount, transactionReference: input.transactionReference.trim(), senderPhone: input.senderPhone.trim(), status: "PENDING", submittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
