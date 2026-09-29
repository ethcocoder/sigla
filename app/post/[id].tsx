import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { BrandLockup } from "@/components/brand-lockup";
import { StatusBadge } from "@/components/status-badge";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { showContactOptions } from "@/lib/contact";
import { demoPosts } from "@/data/demo";

export default function PostDetailScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const post = demoPosts.find((item) => item.id === id) ?? demoPosts[0];
  const price = post.priceType === "FIXED" && post.price ? `${post.price.toLocaleString()} ETB` : post.priceType === "NEGOTIABLE" ? t("post.negotiable") : t("post.contactForPrice");

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topbar}><Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.foreground} /></Pressable><BrandLockup compact /><View style={{ width: 42 }} /></View>
        <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
        <View style={styles.badges}><StatusBadge kind="postType" type={post.type} /><Text style={[styles.time, { color: colors.muted }]}>{post.createdAtLabel}</Text></View>
        <Text style={[styles.category, { color: colors.primaryDark }]}>{post.categoryLabel}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{post.productName}</Text>
        <View style={styles.metaGrid}><View><Text style={[styles.metaLabel, { color: colors.muted }]}>{t("common.quantity")}</Text><Text style={[styles.metaValue, { color: colors.foreground }]}>{post.quantity} {post.unit}</Text></View><View><Text style={[styles.metaLabel, { color: colors.muted }]}>{t("common.location")}</Text><Text style={[styles.metaValue, { color: colors.foreground }]}>{post.locationLabel}</Text></View><View><Text style={[styles.metaLabel, { color: colors.muted }]}>Price</Text><Text style={[styles.metaValue, { color: colors.foreground }]}>{price}</Text></View></View>
        <Text style={[styles.description, { color: colors.muted }]}>{post.description}</Text>
        <View style={[styles.poster, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}><Text style={[styles.avatarText, { color: colors.primaryDark }]}>{post.poster.name.charAt(0)}</Text></View><View style={styles.posterCopy}><Text style={[styles.posterName, { color: colors.foreground }]}>{post.poster.name}</Text><Text style={[styles.posterLocation, { color: colors.muted }]}>{post.poster.locationLabel}</Text></View><Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} /></View>
        <ActionButton label={t("home.contact")} onPress={() => showContactOptions(post)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingBottom: 36, maxWidth: 720, width: "100%", alignSelf: "center" }, topbar: { height: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" }, image: { width: "100%", height: 280, borderRadius: Radii.lg, backgroundColor: "#E2E8F0" }, badges: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.lg }, time: { ...Typography.caption }, category: { ...Typography.label, marginTop: Spacing.xl, textTransform: "uppercase" }, title: { ...Typography.display, fontSize: 30, marginTop: 4 }, metaGrid: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.md, marginTop: Spacing.xl, paddingVertical: Spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E2E8F0" }, metaLabel: { ...Typography.caption }, metaValue: { ...Typography.body, fontWeight: "700", marginTop: 4 }, description: { ...Typography.body, lineHeight: 24, marginTop: Spacing.xl }, poster: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginVertical: Spacing.xxl }, avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" }, avatarText: { fontWeight: "800", fontSize: 18 }, posterCopy: { flex: 1, marginLeft: Spacing.md }, posterName: { ...Typography.body, fontWeight: "700" }, posterLocation: { ...Typography.caption, marginTop: 2 },
});
