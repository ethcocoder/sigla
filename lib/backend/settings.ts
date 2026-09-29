import { demoSettings } from "@/data/demo";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { MarketplaceSettings } from "@/types/domain";

type SettingsRow = {
  app_name_en: string;
  app_name_am: string;
  registration_fee: number;
  post_fee: number;
  telebirr_number: string;
  max_posts_per_day: number;
  max_images_per_post: number;
  post_expiration_days: number;
  allow_new_registrations: boolean;
  require_post_approval: boolean;
  require_user_approval: boolean;
  support_phone: string | null;
  support_telegram: string | null;
};

export async function getPlatformSettings(): Promise<MarketplaceSettings> {
  if (!isSupabaseConfigured) return demoSettings;
  const { data, error } = await supabase.from("platform_settings").select("app_name_en,app_name_am,registration_fee,post_fee,telebirr_number,max_posts_per_day,max_images_per_post,post_expiration_days,allow_new_registrations,require_post_approval,require_user_approval,support_phone,support_telegram").eq("id", "platform").maybeSingle();
  if (error) throw error;
  if (!data) return demoSettings;
  const row = data as SettingsRow;
  return {
    appNameEn: row.app_name_en,
    appNameAm: row.app_name_am,
    registrationFee: Number(row.registration_fee),
    postFee: Number(row.post_fee),
    telebirrNumber: row.telebirr_number,
    maxPostsPerDay: row.max_posts_per_day,
    maxImagesPerPost: row.max_images_per_post,
    postExpirationDays: row.post_expiration_days,
    allowNewRegistrations: row.allow_new_registrations,
    requirePostApproval: row.require_post_approval,
    requireUserApproval: row.require_user_approval,
    supportPhone: row.support_phone ?? undefined,
    supportTelegram: row.support_telegram ?? undefined,
  };
}
