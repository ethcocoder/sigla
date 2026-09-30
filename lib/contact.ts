import { Linking } from "react-native";
import type { MarketplacePost } from "@/types/domain";
import { showAppDialog } from "@/lib/app-dialog";

function open(url: string) {
  void Linking.openURL(url).catch(() =>
    showAppDialog({
      title: "Unable to open link",
      message: "Please try again or use the contact details shown.",
    }),
  );
}
function link(value: string, base: string) {
  const clean = value.trim();
  if (!clean) return null;
  return clean.startsWith("http") ? clean : `${base}${clean.replace(/^@/, "")}`;
}

export function showContactOptions(post: MarketplacePost) {
  const info = post.contactInfo ?? { phone: "" };
  const summary = [
    info.phone ? `Mobile: ${info.phone}` : "",
    info.whatsapp ? `WhatsApp: ${info.whatsapp}` : "",
    info.telegram ? `Telegram: ${info.telegram}` : "",
    info.facebook ? `Facebook: ${info.facebook}` : "",
    info.instagram ? `Instagram: ${info.instagram}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const message = summary || "The poster did not add contact details.";
  const actions = [
    info.phone
      ? { label: "Call mobile", onPress: () => open(`tel:${info.phone}`), variant: "primary" as const }
      : null,
    info.whatsapp
      ? { label: "Open WhatsApp", onPress: () => open(link(info.whatsapp!, "https://wa.me/")!), variant: "primary" as const }
      : null,
    info.telegram
      ? { label: "Open Telegram", onPress: () => open(link(info.telegram!, "https://t.me/")!), variant: "primary" as const }
      : null,
    info.facebook
      ? { label: "Open Facebook", onPress: () => open(link(info.facebook!, "https://facebook.com/")!), variant: "primary" as const }
      : null,
    info.instagram
      ? { label: "Open Instagram", onPress: () => open(link(info.instagram!, "https://instagram.com/")!), variant: "primary" as const }
      : null,
  ].filter((action): action is NonNullable<typeof action> => Boolean(action));

  showAppDialog({
    title: `Contact ${post.poster.name}`,
    message,
    actions: [
      ...actions,
      { label: "Close", variant: "outline" as const },
    ],
  });
}
