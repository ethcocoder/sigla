import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

type ActionButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  compact?: boolean;
};

export function ActionButton({ label, variant = "primary", compact = false, style, ...props }: ActionButtonProps) {
  const colors = useColors("light");
  const palette = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary, text: colors.white },
    secondary: { backgroundColor: colors.secondary, borderColor: colors.secondary, text: colors.white },
    outline: { backgroundColor: colors.surface, borderColor: colors.border, text: colors.foreground },
    ghost: { backgroundColor: "transparent", borderColor: "transparent", text: colors.primaryDark },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <Text style={[styles.label, compact && styles.compactLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: { minHeight: 38, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  label: { ...Typography.body, fontWeight: "700" },
  compactLabel: { ...Typography.caption, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
