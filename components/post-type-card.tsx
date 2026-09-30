import { Ionicons } from "@/components/ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "@/components/status-badge";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import type { PostType } from "@/types/domain";

type PostTypeCardProps = { type: PostType; body: string; onPress?: () => void };

export function PostTypeCard({ type, body, onPress }: PostTypeCardProps) {
  const colors = useColors("light");
  const { t } = useTranslation();
  const isHave = type === "HAVE";
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: isHave ? colors.primarySoft : colors.secondarySoft }, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: isHave ? colors.primarySoft : colors.secondarySoft }]}><Ionicons name={isHave ? "leaf-outline" : "search-outline"} size={26} color={isHave ? colors.primaryDark : colors.secondaryDark} /></View>
      <View style={styles.copy}><StatusBadge kind="postType" type={type} /><Text style={[styles.title, { color: colors.foreground }]}>{isHave ? t("post.have") : t("post.need")}</Text><Text style={[styles.body, { color: colors.muted }]}>{body}</Text></View>
      <Ionicons name="chevron-forward" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({ card: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.md }, icon: { width: 52, height: 52, borderRadius: Radii.md, alignItems: "center", justifyContent: "center" }, copy: { flex: 1, gap: 5 }, title: { ...Typography.heading }, body: { ...Typography.caption, lineHeight: 18 }, pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] } });
