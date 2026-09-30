import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toIso } from "./firestore-helpers";

export type AdminPostRow = {
  id: string;
  type: "HAVE" | "NEED";
  category_label: string;
  product_name: string;
  description: string;
  quantity: number;
  unit: string;
  location_label: string;
  status: string;
  created_at: string;
  profiles: { name: string; phone: string } | null;
};
export type AdminPaymentRow = {
  id: string;
  user_id: string;
  post_id?: string;
  type: "REGISTRATION" | "POST";
  amount: number;
  transaction_reference: string;
  sender_phone: string;
  account_holder_name: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submitted_at: string;
  profiles: { name: string; phone: string } | null;
};

export async function listAdminPosts() {
  const snapshot = await getDocs(
    query(
      collection(firestore, "posts"),
      where("status", "in", ["PENDING_REVIEW", "PAYMENT_PENDING", "DRAFT"]),
      limit(50),
    ),
  );
  return snapshot.docs.map((item) => {
    const row = item.data();
    return {
      id: item.id,
      type: row.type,
      category_label: row.categoryLabel ?? "Other",
      product_name: row.productName,
      description: row.description,
      quantity: Number(row.quantity),
      unit: row.unit,
      location_label: row.locationLabel,
      status: row.status,
      created_at: toIso(row.createdAt),
      profiles:
        row.posterName || row.posterPhone
          ? {
              name: row.posterName ?? "SIGLA member",
              phone: row.posterPhone ?? "",
            }
          : null,
    };
  });
}
export async function reviewPost(input: {
  id: string;
  status: "APPROVED" | "REJECTED";
  adminId: string;
  rejectionReason?: string;
}) {
  await updateDoc(
    doc(firestore, "posts", input.id),
    input.status === "APPROVED"
      ? {
          status: input.status,
          approvedBy: input.adminId,
          approvedAt: serverTimestamp(),
          rejectionReason: null,
          updatedAt: serverTimestamp(),
        }
      : {
          status: input.status,
          approvedBy: null,
          approvedAt: null,
          rejectionReason:
            input.rejectionReason?.trim() || "Rejected by administrator",
          updatedAt: serverTimestamp(),
        },
  );
}
export async function listAdminPayments() {
  const snapshot = await getDocs(
    query(
      collection(firestore, "payments"),
      where("status", "==", "PENDING"),
      limit(50),
    ),
  );
  return snapshot.docs.map((item) => {
    const row = item.data();
    return {
      id: item.id,
      user_id: row.userId,
      post_id: row.postId,
      type: row.type,
      amount: Number(row.amount),
      transaction_reference: row.transactionReference,
      sender_phone: row.senderPhone,
      account_holder_name: row.accountHolderName ?? row.payerName ?? "",
      status: row.status,
      submitted_at: toIso(row.submittedAt),
      profiles:
        row.payerName || row.senderPhone
          ? {
              name: row.payerName ?? "SIGLA member",
              phone: row.senderPhone ?? "",
            }
          : null,
    };
  });
}
export async function reviewPayment(input: {
  id: string;
  status: "VERIFIED" | "REJECTED";
  adminId: string;
  rejectionReason?: string;
}) {
  const paymentRef = doc(firestore, "payments", input.id);
  const paymentSnapshot = await getDoc(paymentRef);
  if (!paymentSnapshot.exists()) throw new Error("Payment record not found.");
  const payment = paymentSnapshot.data();
  await updateDoc(
    paymentRef,
    input.status === "VERIFIED"
      ? {
          status: input.status,
          verifiedBy: input.adminId,
          verifiedAt: serverTimestamp(),
          rejectionReason: null,
          updatedAt: serverTimestamp(),
        }
      : {
          status: input.status,
          verifiedBy: input.adminId,
          verifiedAt: null,
          rejectionReason:
            input.rejectionReason?.trim() || "Rejected by administrator",
          updatedAt: serverTimestamp(),
        },
  );
  if (payment.type === "REGISTRATION")
    await updateDoc(doc(firestore, "users", payment.userId), {
      status: input.status === "VERIFIED" ? "ACTIVE" : "REJECTED",
      registrationPaymentStatus: input.status,
      updatedAt: serverTimestamp(),
    });
  if (payment.type === "POST" && payment.postId) {
    const settings = await getAdminSettings();
    await updateDoc(doc(firestore, "posts", payment.postId), {
      status:
        input.status === "VERIFIED"
          ? settings.requirePostApproval === false
            ? "APPROVED"
            : "PENDING_REVIEW"
          : "REJECTED",
      paymentStatus: input.status,
      updatedAt: serverTimestamp(),
    });
  }
}
export async function getAdminSettings() {
  const snapshot = await getDoc(doc(firestore, "settings", "platform"));
  return snapshot.exists() ? snapshot.data() : {};
}
export async function updateAdminSettings(input: {
  registrationFee: number;
  postFee: number;
  telebirrNumber: string;
  telebirrAccountName: string;
  supportPhone: string;
  supportTelegram: string;
  requirePostApproval: boolean;
  requireUserApproval: boolean;
}) {
  await setDoc(
    doc(firestore, "settings", "platform"),
    {
      appNameEn: "SIGLA",
      appNameAm: "ሲግላ",
      ...input,
      telebirrNumber: input.telebirrNumber.trim(),
      telebirrAccountName: input.telebirrAccountName.trim(),
      supportPhone: input.supportPhone.trim(),
      supportTelegram: input.supportTelegram.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
