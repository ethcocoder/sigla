import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/brand-lockup";
import { MarketplaceCard } from "@/components/marketplace-card";
import { SectionTitle } from "@/components/section-title";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { getSafeErrorMessage } from "@/lib/error-message";
import { useTranslation } from "@/lib/i18n-provider";
import { listApprovedPosts } from "@/lib/backend/marketplace";
import { showContactOptions } from "@/lib/contact";
import type { MarketplacePost } from "@/types/domain";

export default function HomeScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      setPosts(await listApprovedPosts({ limit: 12 }));
    } catch (cause) {
      setError(getSafeErrorMessage(cause, "network"));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} tintColor={colors.primary} />}>
        <View style={styles.header}><BrandLockup /><Pressable onPress={() => router.push("/(tabs)/notifications")} accessibilityRole="button" accessibilityLabel={t("nav.notifications")} style={[styles.bell, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="notifications-outline" size={21} color={colors.foreground} /><View style={[styles.notificationDot, { backgroundColor: colors.primary }]} /></Pressable></View>
        <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}>
          <View style={styles.heroCopy}><Text style={styles.eyebrow}>{t("brand.marketplace").toUpperCase()}</Text><Text style={styles.heroTitle}>{t("home.title")}</Text><Text style={styles.heroSubtitle}>{t("home.subtitle")}</Text></View>
          <View style={styles.heroMark}><Ionicons name="leaf" size={84} color="rgba(255,255,255,.18)" /></View>

        </View>
        <SectionTitle title={t("home.latest")} actionLabel={t("home.seeAll")} onAction={() => router.push("/search")} />
        {error ? <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View> : null}
        {refreshing && posts.length === 0 ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : posts.length === 0 ? <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("home.emptyTitle")}</Text><Text style={[styles.emptyBody, { color: colors.muted }]}>{t("home.emptyBody")}</Text></View> : posts.map((post) => <MarketplaceCard key={post.id} post={post} onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onContact={() => showContactOptions(post)} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.lg, paddingBottom: 32, maxWidth: 720, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.xl },
  bell: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, right: 9, top: 8, borderWidth: 1.5, borderColor: "#FFFFFF" },
  hero: { minHeight: 224, borderRadius: Radii.lg, padding: Spacing.xl, marginBottom: Spacing.xxl, overflow: "hidden", position: "relative" },
  heroCopy: { maxWidth: "78%", zIndex: 1 },
  eyebrow: { ...Typography.label, color: "#BBF7D0", letterSpacing: 1.2 },
  heroTitle: { ...Typography.display, color: "#FFFFFF", fontSize: 28, lineHeight: 33, marginTop: Spacing.sm },
  heroSubtitle: { ...Typography.body, color: "#DCFCE7", marginTop: Spacing.sm, lineHeight: 21 },
  heroMark: { position: "absolute", right: -4, top: 6, transform: [{ rotate: "-18deg" }] },
  heroFooter: { position: "absolute", bottom: Spacing.xl, left: Spacing.xl, right: Spacing.xl, flexDirection: "row", alignItems: "center", gap: Spacing.lg },
  heroStat: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  heroStatLabel: { color: "#BBF7D0", fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,.25)" },
  errorBox: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  errorText: { ...Typography.caption, lineHeight: 18 },
  loader: { marginVertical: Spacing.xxl },
  empty: { borderRadius: Radii.lg, borderWidth: 1, padding: Spacing.xxl, alignItems: "center" },
  emptyTitle: { ...Typography.heading },
  emptyBody: { ...Typography.body, color: "#64748B", textAlign: "center", marginTop: Spacing.sm },
});
