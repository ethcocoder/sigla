import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import type { PostStatus, PostType } from "@/types/domain";

type StatusBadgeProps =
  | { kind: "postType"; type: PostType }
  | { kind: "postStatus"; status: PostStatus };

export function StatusBadge(props: StatusBadgeProps) {
  const colors = useColors("light");
  const { t } = useTranslation();
  const isHave = props.kind === "postType" && props.type === "HAVE";
  const label = props.kind === "postType"
    ? t(props.type === "HAVE" ? "post.have" : "post.need")
    : t(props.status === "APPROVED" ? "status.approved" : props.status === "PENDING_REVIEW" ? "status.pending" : props.status === "REJECTED" ? "status.rejected" : "status.expired");
  const backgroundColor = props.kind === "postType"
    ? isHave ? colors.primarySoft : colors.secondarySoft
    : props.status === "APPROVED" ? colors.primarySoft : props.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7";
  const textColor = props.kind === "postType"
    ? isHave ? colors.primaryDark : colors.secondaryDark
    : props.status === "APPROVED" ? colors.primaryDark : props.status === "REJECTED" ? colors.error : "#92400E";

  return (
    <View style={[styles.badge, { backgroundColor }]} accessibilityLabel={label}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...Typography.label, fontSize: 10 },
});
