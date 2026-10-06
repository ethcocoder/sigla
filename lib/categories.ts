import type { Language } from "@/i18n";

export type MarketplaceCategory = {
  id: string;
  labelEn: string;
  labelAm: string;
  icon: string;
  color: string;
  active: boolean;
};

export const DEFAULT_CATEGORIES: MarketplaceCategory[] = [
  { id: "fertilizer", labelEn: "Fertilizer", labelAm: "ማዳበሪያ", icon: "leaf-outline", color: "#A6D94A", active: true },
  { id: "pesticide", labelEn: "Pesticide", labelAm: "ፀረ-ተባይ", icon: "bug-outline", color: "#F2A65A", active: true },
  { id: "herbicide", labelEn: "Herbicide", labelAm: "ፀረ-አረም", icon: "flask-outline", color: "#65C9C9", active: true },
  { id: "seeds", labelEn: "Seeds", labelAm: "ዘሮች", icon: "nutrition-outline", color: "#F4D35E", active: true },
  { id: "equipment", labelEn: "Equipment", labelAm: "መሳሪያዎች", icon: "construct-outline", color: "#B48AE8", active: true },
  { id: "other", labelEn: "Other", labelAm: "ሌሎች", icon: "grid-outline", color: "#9FB3C8", active: true },
];

export function categoryLabel(category: MarketplaceCategory, language: Language) {
  return language === "am" ? category.labelAm : category.labelEn;
}

export function normalizeCategories(value: unknown): MarketplaceCategory[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_CATEGORIES;
  const normalized = value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: String(item.id ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || `category-${Date.now()}`,
      labelEn: String(item.labelEn ?? item.label ?? "Other").trim() || "Other",
      labelAm: String(item.labelAm ?? item.label ?? "ሌሎች").trim() || "ሌሎች",
      icon: String(item.icon ?? "grid-outline"),
      color: String(item.color ?? "#9FB3C8"),
      active: item.active !== false,
    }));
  return normalized.length > 0 ? normalized : DEFAULT_CATEGORIES;
}
