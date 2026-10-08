import { Ionicons as ExpoIonicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type IoniconName = ComponentProps<typeof ExpoIonicons>["name"];
export type IoniconProps = ComponentProps<typeof ExpoIonicons>;

/**
 * One icon implementation for web and native. Using the real Ionicons font
 * everywhere avoids platform-specific placeholder glyphs and keeps icon
 * weight, alignment, and touch targets consistent.
 */
export function Ionicons(props: IoniconProps) {
  return <ExpoIonicons {...props} />;
}

Ionicons.glyphMap = ExpoIonicons.glyphMap;
