import { Ionicons } from "@/components/ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { getSafeErrorMessage } from "@/lib/error-message";
import { listApprovedPosts, subscribeApprovedPosts } from "@/lib/backend/marketplace";
import { getPlatformSettings } from "@/lib/backend/settings";
import { DEFAULT_CATEGORIES, categoryLabel } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n-provider";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { sortRecommendedPosts } from "@/lib/recommendations";
import type { MarketplacePost } from "@/types/domain";

const blue = "#4F8B2A";
export default function HomeScreen() {
  const colors = useColors("light");
  const { language, t } = useTranslation();
  const { profile } = useFirebaseAuth();
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recommendedPosts = sortRecommendedPosts(posts, {
    location: profile?.locationLabel ?? "Addis Ababa",
  });

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      const [nextPosts, settings] = await Promise.all([listApprovedPosts({ limit: 30 }), getPlatformSettings()]);
      setPosts(nextPosts);
      setCategories(settings.categories.filter((item) => item.active));
    } catch (cause) {
      setError(getSafeErrorMessage(cause, "network"));
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    const stopPosts = subscribeApprovedPosts(
      { limit: 30 },
      (nextPosts) => {
        setPosts(nextPosts);
        setRefreshing(false);
      },
      (cause) => setError(getSafeErrorMessage(cause, "network")),
    );
    return () => {
      clearTimeout(timer);
      stopPosts();
    };
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Pressable
          style={styles.location}
          accessibilityRole="button"
          accessibilityLabel={language === "am" ? "ቦታ ቀይር" : language === "om" ? "Bakka jijjiiri" : "Change location"}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="location" size={21} color="#FFFFFF" />
          <Text style={styles.locationText}>{language === "am" ? "አዲስ አበባ" : "Addis Ababa"}</Text>
        </Pressable>
        <View style={styles.toolbar}>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Ionicons name="search" size={23} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Ionicons name="funnel" size={21} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/profile")}>
            <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load()}
            tintColor={blue}
          />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => router.push({ pathname: "/(tabs)/search", params: { categoryId: category.id } })}
              style={styles.category}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.categoryLabel}>{categoryLabel(category, language)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.feedHeader}>
          <View style={styles.feedTitleRow}>
            <Ionicons name="sparkles-outline" size={18} color="#4F8B2A" />
            <Text style={styles.feedTitle}>{t("home.recommended")}</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Ionicons name="swap-vertical" size={22} color="#68727C" />
          </Pressable>
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
        {refreshing && posts.length === 0 ? (
          <ActivityIndicator color={blue} style={styles.loader} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={32} color="#8DAA39" />
            <Text style={styles.emptyTitle}>{t("home.emptyTitle")}</Text>
            <Text style={styles.emptyBody}>
              {t("home.emptyBody")}
            </Text>
          </View>
        ) : (
          recommendedPosts.map((post) => (
            <CompactListing
              key={post.id}
              post={post}
              onPress={() =>
                router.push({ pathname: "/post/[id]", params: { id: post.id } })
              }
              onMessage={() =>
                router.push({
                  pathname: "/messages/chat" as never,
                  params: {
                    otherUserId: post.poster.id,
                    otherName: post.poster.name,
                    listingId: post.id,
                    listingName: post.productName,
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CompactListing({
  post,
  onPress,
  onMessage,
}: {
  post: MarketplacePost;
  onPress: () => void;
  onMessage: () => void;
}) {
  const price =
    post.priceType === "FIXED" && post.price != null
      ? `${post.price.toLocaleString()} Birr`
      : post.priceType === "NEGOTIABLE"
        ? "Negotiable"
        : "Contact seller";
  return (
    <View style={styles.listing}>
      <Pressable onPress={onPress} style={styles.listingMain}>
        <View style={styles.thumb}>
          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.thumbImage}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="image-outline" size={28} color="#9AA3AB" />
          )}
        </View>
        <View style={styles.listingCopy}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {post.productName}
          </Text>
          <Text style={styles.listingSeller} numberOfLines={1}>
            {post.poster.name} · {post.locationLabel}
          </Text>
          <Text style={styles.listingMeta}>
            {post.type === "HAVE" ? "AVAILABLE" : "WANTED"} · {post.quantity}{" "}
            {post.unit}
          </Text>
          <Text style={styles.listingPrice}>{price}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onMessage} style={styles.messageButton}>
        <Ionicons name="chatbox-ellipses-outline" size={20} color={blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topbar: {
    height: 74,
    backgroundColor: blue,
    paddingHorizontal: 18,
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  location: { flexDirection: "row", alignItems: "center", gap: 7 },
  locationText: { color: "#FFE45B", fontSize: 16, fontWeight: "900" },
  toolbar: { flexDirection: "row", gap: 21, alignItems: "center" },
  categories: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE3E7",
  },
  category: { alignItems: "center", width: 64 },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    color: "#25292D",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },
  feedHeader: {
    minHeight: 54,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE3E7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feedTitle: { color: "#1B5E20", fontSize: 17, fontWeight: "900" },
  feedTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  error: { padding: 18, fontSize: 13 },
  loader: { marginVertical: 35 },
  listing: {
    minHeight: 128,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E7",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  listingMain: { flex: 1, flexDirection: "row", gap: 12 },
  thumb: {
    width: 92,
    height: 98,
    backgroundColor: "#F0F2F3",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImage: { width: "100%", height: "100%" },
  listingCopy: { flex: 1, paddingVertical: 2 },
  listingTitle: { color: "#4F8B2A", fontSize: 17, fontWeight: "800" },
  listingSeller: { color: "#454B50", fontSize: 13, marginTop: 6 },
  listingMeta: {
    color: "#4C5358",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },
  listingPrice: {
    color: "#79A632",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  messageButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", padding: 42 },
  emptyTitle: { color: "#222", fontSize: 18, fontWeight: "800", marginTop: 10 },
  emptyBody: {
    color: "#68727C",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
