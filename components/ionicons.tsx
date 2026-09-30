import { Platform, Text, type ColorValue } from "react-native";

type IoniconProps = { name: string; size?: number; color?: ColorValue; style?: unknown };

type NativeIconComponent = (props: IoniconProps) => React.ReactElement;

const webGlyphs: Record<string, string> = {
  "notifications-outline": "♢", "leaf": "⌁", "shield-outline": "◇", "shield-checkmark": "✓", "checkmark-done-outline": "✓", "receipt-outline": "▤", "document-text-outline": "▧", "megaphone-outline": "◖", "checkmark-circle": "✓", "log-out-outline": "↪", "chevron-forward": "›", "arrow-back": "‹", "chevron-down": "⌄", "image-outline": "▧", "refresh-outline": "↻", "trash-outline": "×", "information-circle-outline": "ⓘ", "search-outline": "⌕", "add": "+", "close": "×",
};

export function Ionicons(props: IoniconProps) {
  if (Platform.OS === "web") {
    return <Text accessibilityRole="image" style={[{ fontSize: props.size ?? 20, color: props.color }, props.style as any]}>{webGlyphs[props.name] ?? "•"}</Text>;
  }
  // Keep the native icon font out of the web bundle/server render.
  const { Ionicons: NativeIonicons } = require("@expo/vector-icons") as { Ionicons: NativeIconComponent };
  return <NativeIonicons {...props} />;
}

Ionicons.glyphMap = {} as Record<string, string>;
