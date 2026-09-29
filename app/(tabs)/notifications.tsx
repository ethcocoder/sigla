import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { demoNotifications } from "@/data/demo";

export default function NotificationsScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("notifications.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t("notifications.emptyBody")}</Text>
        {demoNotifications.length === 0 ? <EmptyState title={t("notifications.emptyTitle")} body={t("notifications.emptyBody")} icon="notifications-outline" /> : demoNotifications.map((item) => <View key={item.id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: item.read ? colors.background : colors.primarySoft }]}><Ionicons name={item.kind === "PAYMENT" ? "receipt-outline" : item.kind === "POST" ? "document-text-outline" : "megaphone-outline"} size={20} color={item.read ? colors.muted : colors.primaryDark} /></View><View style={styles.copy}><View style={styles.itemHeader}><Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.time, { color: colors.muted }]}>{item.createdAtLabel}</Text></View><Text style={[styles.body, { color: colors.muted }]}>{item.body}</Text></View>{!item.read ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}</View>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.xl, paddingBottom: 32, maxWidth: 720, width: "100%", alignSelf: "center" }, title: { ...Typography.title }, subtitle: { ...Typography.body, marginTop: 4, marginBottom: Spacing.xl }, item: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.lg, marginBottom: Spacing.md }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, copy: { flex: 1 }, itemHeader: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm }, itemTitle: { ...Typography.body, fontWeight: "700", flex: 1 }, time: { ...Typography.caption }, body: { ...Typography.caption, lineHeight: 18, marginTop: 4 }, dot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
});
