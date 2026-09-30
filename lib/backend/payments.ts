import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";

function currentUser() { const user = firebaseAuth.currentUser; if (!user) throw new Error("Your account session is not ready. Please sign in and try again."); return user; }
function required(value: string, label: string) { const clean = value.trim(); if (!clean) throw new Error(`${label} is required.`); return clean; }

export async function submitRegistrationPayment(input: { amount: number; senderPhone: string; transactionReference: string; accountHolderName: string }) {
  const user = currentUser();
  const transactionReference = required(input.transactionReference, "Telebirr transaction number");
  const accountHolderName = required(input.accountHolderName, "Telebirr account holder name");
  await addDoc(collection(firestore, "payments"), { userId: user.uid, payerName: user.displayName ?? accountHolderName, type: "REGISTRATION", amount: input.amount, transactionReference, senderPhone: required(input.senderPhone, "Sender phone number"), accountHolderName, status: "PENDING", submittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await updateDoc(doc(firestore, "users", user.uid), { status: "PAYMENT_PENDING", registrationTransactionReference: transactionReference, registrationPaymentSubmittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function submitPostPayment(input: { postId: string; amount: number; senderPhone: string; transactionReference: string; accountHolderName: string }) {
  const user = currentUser();
  const transactionReference = required(input.transactionReference, "Telebirr transaction number");
  const accountHolderName = required(input.accountHolderName, "Telebirr account holder name");
  await addDoc(collection(firestore, "payments"), { userId: user.uid, postId: input.postId, payerName: user.displayName ?? accountHolderName, type: "POST", amount: input.amount, transactionReference, senderPhone: required(input.senderPhone, "Sender phone number"), accountHolderName, status: "PENDING", submittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
