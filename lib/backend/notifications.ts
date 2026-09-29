import { demoNotifications } from "@/data/demo";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { NotificationItem } from "@/types/domain";

export async function listNotifications(userId: string): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) return demoNotifications;
  const { data, error } = await supabase.from("notifications").select("id,type,title,body,read_at,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, body: row.body, kind: row.type, createdAtLabel: new Date(row.created_at).toLocaleDateString(), read: Boolean(row.read_at) }));
}

export async function markNotificationRead(id: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
