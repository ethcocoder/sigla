import { supabase } from "@/lib/supabase";
import type { UserProfile, UserStatus } from "@/types/domain";

export async function getCurrentProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("profiles").select("id,name,phone,role,status,location_label,avatar_url").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as UserProfile;
}

export async function listUserPosts(userId: string) {
  const { data, error } = await supabase.from("posts").select("id,type,category_label,product_name,description,quantity,unit,location_label,status,created_at,expires_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function listUserPayments(userId: string) {
  const { data, error } = await supabase.from("payments").select("id,type,amount,transaction_reference,sender_phone,status,submitted_at,updated_at").eq("user_id", userId).order("submitted_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export function statusLabel(status: UserStatus) {
  return status.replaceAll("_", " ").toLowerCase().replace(/(^| )\S/g, (value) => value.toUpperCase());
}
