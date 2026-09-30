import { Alert, Linking } from "react-native";
import type { MarketplacePost } from "@/types/domain";

function open(url: string) { void Linking.openURL(url).catch(() => Alert.alert("Unable to open", "Please try again or use the contact details shown.")); }
function link(value: string, base: string) { const clean = value.trim(); if (!clean) return null; return clean.startsWith("http") ? clean : `${base}${clean.replace(/^@/, "")}`; }

export function showContactOptions(post: MarketplacePost) {
  const info = post.contactInfo ?? { phone: "" };
  const summary = [info.phone ? `Mobile: ${info.phone}` : "", info.whatsapp ? `WhatsApp: ${info.whatsapp}` : "", info.telegram ? `Telegram: ${info.telegram}` : "", info.facebook ? `Facebook: ${info.facebook}` : "", info.instagram ? `Instagram: ${info.instagram}` : ""].filter(Boolean).join("\n");
  const buttons: { text: string; onPress: () => void }[] = [];
  if (info.phone) buttons.push({ text: "Call mobile", onPress: () => open(`tel:${info.phone}`) });
  if (info.whatsapp) buttons.push({ text: "Open WhatsApp", onPress: () => open(link(info.whatsapp!, "https://wa.me/")!) });
  if (info.telegram) buttons.push({ text: "Open Telegram", onPress: () => open(link(info.telegram!, "https://t.me/")!) });
  if (info.facebook) buttons.push({ text: "Open Facebook", onPress: () => open(link(info.facebook!, "https://facebook.com/")!) });
  if (info.instagram) buttons.push({ text: "Open Instagram", onPress: () => open(link(info.instagram!, "https://instagram.com/")!) });
  buttons.push({ text: "Close", onPress: () => undefined });
  Alert.alert(`Contact ${post.poster.name}`, summary || "The poster did not add contact details.", buttons);
}
