import { Alert, Linking, Platform } from "react-native";
import type { ContactMethod, MarketplacePost } from "@/types/domain";

const methodLabels: Record<ContactMethod, string> = {
  CALL: "Call poster",
  TELEGRAM: "Open Telegram",
  WHATSAPP: "Open WhatsApp",
};

function getUrl(method: ContactMethod, post: MarketplacePost): string | null {
  // Public listings expose contact actions without exposing private phone numbers. Keep the action explicit
  // until authenticated contact details are supplied by the backend.
  if (method === "CALL") return null;
  if (method === "TELEGRAM") return "https://t.me/sigla_support";
  return "https://wa.me/251915550101";
}

export function showContactOptions(post: MarketplacePost) {
  const methods = post.contactMethods.length ? post.contactMethods : ["CALL" as const];
  const buttons = methods.map((method) => ({
    text: methodLabels[method],
    onPress: () => {
      const url = getUrl(method, post);
      if (!url) {
        Alert.alert("Contact details", "The poster’s phone number is shared after account verification.");
        return;
      }
      void Linking.openURL(url).catch(() => Alert.alert("Unable to open", "Please try again or contact SIGLA support."));
    },
  }));
  buttons.push({ text: "Cancel", onPress: () => undefined });
  if (Platform.OS === "web") {
    // Alert is supported by Expo Web and keeps this interaction accessible.
    Alert.alert(`Contact ${post.poster.name}`, "Choose a contact method.", buttons);
    return;
  }
  Alert.alert(`Contact ${post.poster.name}`, "Choose a contact method.", buttons);
}
