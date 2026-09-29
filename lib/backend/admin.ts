import { supabase } from "@/lib/supabase";

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
  type: "REGISTRATION" | "POST";
  amount: number;
  transaction_reference: string;
  sender_phone: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submitted_at: string;
  profiles: { name: string; phone: string } | null;
};

export async function listAdminPosts() {
  const { data, error } = await supabase.from("posts").select("id,type,category_label,product_name,description,quantity,unit,location_label,status,created_at,profiles!posts_user_id_fkey(name,phone)").in("status", ["PENDING_REVIEW", "PAYMENT_PENDING", "DRAFT"]).order("created_at", { ascending: true }).limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as AdminPostRow[];
}

export async function reviewPost(input: { id: string; status: "APPROVED" | "REJECTED"; adminId: string; rejectionReason?: string }) {
  const payload = input.status === "APPROVED"
    ? { status: input.status, approved_by: input.adminId, approved_at: new Date().toISOString(), rejection_reason: null }
    : { status: input.status, approved_by: null, approved_at: null, rejection_reason: input.rejectionReason?.trim() || "Rejected by administrator" };
  const { error } = await supabase.from("posts").update(payload).eq("id", input.id);
  if (error) throw error;
}

export async function listAdminPayments() {
  const { data, error } = await supabase.from("payments").select("id,type,amount,transaction_reference,sender_phone,status,submitted_at,profiles!payments_user_id_fkey(name,phone)").eq("status", "PENDING").order("submitted_at", { ascending: true }).limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as AdminPaymentRow[];
}

export async function reviewPayment(input: { id: string; status: "VERIFIED" | "REJECTED"; adminId: string; rejectionReason?: string }) {
  const payload = input.status === "VERIFIED"
    ? { status: input.status, verified_by: input.adminId, verified_at: new Date().toISOString(), rejection_reason: null }
    : { status: input.status, verified_by: input.adminId, verified_at: null, rejection_reason: input.rejectionReason?.trim() || "Rejected by administrator" };
  const { error } = await supabase.from("payments").update(payload).eq("id", input.id);
  if (error) throw error;
}

export async function getAdminSettings() {
  const { data, error } = await supabase.from("platform_settings").select("id,app_name_en,app_name_am,registration_fee,post_fee,telebirr_number,max_posts_per_day,max_active_posts,max_images_per_post,max_image_size_bytes,post_expiration_days,allow_new_registrations,require_post_approval,require_user_approval,support_phone,support_telegram,about_content,terms_content,privacy_content").eq("id", "platform").single();
  if (error) throw error;
  return data;
}

export async function updateAdminSettings(input: { registrationFee: number; postFee: number; telebirrNumber: string; supportPhone: string; supportTelegram: string; requirePostApproval: boolean; requireUserApproval: boolean }) {
  const { error } = await supabase.from("platform_settings").update({ registration_fee: input.registrationFee, post_fee: input.postFee, telebirr_number: input.telebirrNumber.trim(), support_phone: input.supportPhone.trim() || null, support_telegram: input.supportTelegram.trim() || null, require_post_approval: input.requirePostApproval, require_user_approval: input.requireUserApproval, updated_at: new Date().toISOString() }).eq("id", "platform");
  if (error) throw error;
}
