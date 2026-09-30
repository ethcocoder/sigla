import { Ionicons } from "@/components/ionicons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { StatusBadge } from "@/components/status-badge";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import type { MarketplacePost } from "@/types/domain";

type MarketplaceCardProps = { post: MarketplacePost; onPress?: () => void; onContact?: () => void };

export function MarketplaceCard({ post, onPress, onContact }: MarketplaceCardProps) {
  const colors = useColors("light");
  const { t } = useTranslation();
  const price = post.priceType === "FIXED" && post.price ? `${post.price.toLocaleString()} ETB` : post.priceType === "NEGOTIABLE" ? t("post.negotiable") : t("post.contactForPrice");

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${post.productName}, ${post.type === "HAVE" ? t("post.have") : t("post.need")}`} style={(state) => [state.pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={180} />
        <View style={styles.overlayTop}><StatusBadge kind="postType" type={post.type} /><Text style={styles.time}>{post.createdAtLabel}</Text></View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.category, { color: colors.primaryDark }]}>{post.categoryLabel}</Text>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{post.productName}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Ionicons name="cube-outline" size={15} color={colors.muted} /><Text style={[styles.meta, { color: colors.muted }]}>{post.quantity} {post.unit}</Text></View>
          <View style={styles.metaItem}><Ionicons name="location-outline" size={15} color={colors.muted} /><Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{post.locationLabel}</Text></View>
        </View>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>{post.description}</Text>
      </View>
      </Pressable>
      <View style={[styles.footer, { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg }]}>
        <View><Text style={[styles.price, { color: colors.foreground }]}>{price}</Text><Text style={[styles.poster, { color: colors.muted }]}>{post.poster.name}</Text></View>
        <ActionButton label={t("home.contact")} compact variant={post.type === "HAVE" ? "primary" : "secondary"} onPress={onContact} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radii.lg, borderWidth: 1, overflow: "hidden", marginBottom: Spacing.lg, shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  pressed: { opacity: 0.95, transform: [{ scale: 0.995 }] },
  imageWrap: { height: 220, backgroundColor: "#E2E8F0" },
  image: { width: "100%", height: "100%" },
  overlayTop: { position: "absolute", top: Spacing.md, left: Spacing.md, right: Spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textShadowColor: "rgba(0,0,0,.45)", textShadowRadius: 4 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleWrap: { flex: 1, marginRight: Spacing.sm },
  category: { ...Typography.label, textTransform: "uppercase" },
  title: { ...Typography.title, fontSize: 21, marginTop: 3 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: "70%" },
  meta: { ...Typography.caption },
  description: { ...Typography.body, lineHeight: 21 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(226,232,240,.7)", paddingTop: Spacing.md },
  price: { ...Typography.heading, fontSize: 16 },
  poster: { ...Typography.caption, marginTop: 2 },
});
