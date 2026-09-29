import { Pressable, StyleSheet, Text } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

type FilterChipProps = { label: string; active?: boolean; onPress?: () => void };

export function FilterChip({ label, active = false, onPress }: FilterChipProps) {
  const colors = useColors("light");
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.chip, { backgroundColor: active ? colors.primarySoft : colors.surface, borderColor: active ? colors.primary : colors.border }, pressed && styles.pressed]}>
      <Text style={[styles.label, { color: active ? colors.primaryDark : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ chip: { borderWidth: 1, borderRadius: Radii.pill, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }, label: { ...Typography.caption, fontWeight: "700" }, pressed: { opacity: 0.72 } });
