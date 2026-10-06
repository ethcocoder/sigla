import { doc, getDoc } from "firebase/firestore";
import type { MarketplaceSettings } from "@/types/domain";
import { firestore } from "@/lib/firebase";
import { DEFAULT_CATEGORIES, normalizeCategories } from "@/lib/categories";

const defaults: MarketplaceSettings = { appNameEn: "SIGLA", appNameAm: "ሲግላ", registrationFee: 0, postFee: 0, telebirrNumber: "", telebirrAccountName: "", maxPostsPerDay: 10, maxImagesPerPost: 1, postExpirationDays: 30, allowNewRegistrations: true, requirePostApproval: true, requireUserApproval: true, categories: DEFAULT_CATEGORIES };
export async function getPlatformSettings(): Promise<MarketplaceSettings> {
  const snapshot = await getDoc(doc(firestore, "settings", "platform"));
  if (!snapshot.exists()) return defaults;
  const data = snapshot.data();
  return { ...defaults, appNameEn: data.appNameEn ?? defaults.appNameEn, appNameAm: data.appNameAm ?? defaults.appNameAm, registrationFee: Number(data.registrationFee ?? 0), postFee: Number(data.postFee ?? 0), telebirrNumber: data.telebirrNumber ?? "", telebirrAccountName: data.telebirrAccountName ?? data.telebirrAccountHolder ?? "", maxPostsPerDay: Number(data.maxPostsPerDay ?? defaults.maxPostsPerDay), maxImagesPerPost: Number(data.maxImagesPerPost ?? defaults.maxImagesPerPost), postExpirationDays: Number(data.postExpirationDays ?? defaults.postExpirationDays), allowNewRegistrations: data.allowNewRegistrations ?? true, requirePostApproval: data.requirePostApproval ?? true, requireUserApproval: data.requireUserApproval ?? true, categories: normalizeCategories(data.categories), supportPhone: data.supportPhone || undefined, supportTelegram: data.supportTelegram || undefined };
}
