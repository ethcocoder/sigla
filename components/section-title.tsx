import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Spacing, Typography } from "@/lib/_core/theme";

type SectionTitleProps = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionTitle({ title, actionLabel, onAction }: SectionTitleProps) {
  const colors = useColors("light");
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction ? <Pressable onPress={onAction} accessibilityRole="button"><Text style={[styles.action, { color: colors.primaryDark }]}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md }, title: { ...Typography.heading }, action: { ...Typography.caption, fontWeight: "700" } });
