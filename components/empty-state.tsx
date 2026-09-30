import { Ionicons } from "@/components/ionicons";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

type EmptyStateProps = { title: string; body: string; actionLabel?: string; onAction?: () => void; icon?: keyof typeof Ionicons.glyphMap };

export function EmptyState({ title, body, actionLabel, onAction, icon = "leaf-outline" }: EmptyStateProps) {
  const colors = useColors("light");
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={28} color={colors.primaryDark} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
      {actionLabel && onAction ? <ActionButton label={actionLabel} variant="outline" compact onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", padding: Spacing.xxl, gap: Spacing.sm, minHeight: 220 },
  icon: { width: 58, height: 58, borderRadius: Radii.lg, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
  title: { ...Typography.heading, textAlign: "center" },
  body: { ...Typography.body, textAlign: "center", maxWidth: 290, lineHeight: 21, marginBottom: Spacing.sm },
});
