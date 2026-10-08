import type { Language } from "@/i18n";

export type MarketplaceCategory = {
  id: string;
  labelEn: string;
  labelAm: string;
  labelOm?: string;
  icon: string;
  color: string;
  active: boolean;
};

export const DEFAULT_CATEGORIES: MarketplaceCategory[] = [
  { id: "fertilizer", labelEn: "Fertilizer", labelAm: "ማዳበሪያ", labelOm: "Xaa'oo", icon: "leaf-outline", color: "#A6D94A", active: true },
  { id: "pesticide", labelEn: "Pesticide", labelAm: "ፀረ-ተባይ", labelOm: "Qoricha ilbiisummaa", icon: "bug-outline", color: "#F2A65A", active: true },
  { id: "herbicide", labelEn: "Herbicide", labelAm: "ፀረ-አረም", labelOm: "Qoricha aramaa", icon: "flask-outline", color: "#65C9C9", active: true },
  { id: "seeds", labelEn: "Seeds", labelAm: "ዘሮች", labelOm: "Sanyii", icon: "nutrition-outline", color: "#F4D35E", active: true },
  { id: "equipment", labelEn: "Equipment", labelAm: "መሳሪያዎች", labelOm: "Meeshaalee", icon: "construct-outline", color: "#B48AE8", active: true },
  { id: "other", labelEn: "Other", labelAm: "ሌሎች", labelOm: "Kan biraa", icon: "grid-outline", color: "#9FB3C8", active: true },
];

export function categoryLabel(category: MarketplaceCategory, language: Language) {
  if (language === "am") return category.labelAm;
  if (language === "om") return category.labelOm || category.labelEn;
  return category.labelEn;
}

export function normalizeCategories(value: unknown): MarketplaceCategory[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_CATEGORIES;
  const normalized = value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: String(item.id ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || `category-${Date.now()}`,
      labelEn: String(item.labelEn ?? item.label ?? "Other").trim() || "Other",
      labelAm: String(item.labelAm ?? item.label ?? "ሌሎች").trim() || "ሌሎች",
      labelOm: String(item.labelOm ?? item.labelEn ?? item.label ?? "Kan biraa").trim() || "Kan biraa",
      icon: String(item.icon ?? "grid-outline"),
      color: String(item.color ?? "#9FB3C8"),
      active: item.active !== false,
    }));
  return normalized.length > 0 ? normalized : DEFAULT_CATEGORIES;
}
