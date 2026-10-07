import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@/components/ionicons";
import { subscribeApprovedPosts } from "@/lib/backend/marketplace";
import type { MarketplacePost } from "@/types/domain";
import { useTranslation } from "@/lib/i18n-provider";

export default function WatchlistScreen() {
  const { t } = useTranslation();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return subscribeApprovedPosts(
      { limit: 12, categoryId: typeof categoryId === "string" ? categoryId : undefined },
      (nextPosts) => {
        setPosts(nextPosts);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [categoryId]);
  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.push("/(tabs)")}>
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topbarTitle}>{categoryId ? t("category.title") : t("nav.search")}</Text>
        <View style={{ width: 23 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {
          <Text style={styles.subtitle}>
            {categoryId ? t("category.helper") : t("search.placeholder")}
          </Text>
        }
        {loading ? (
          <ActivityIndicator color="#4F8B2A" style={styles.loader} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={40} color="#8C969E" />
            <Text style={styles.emptyTitle}>{t("category.empty")}</Text>
            <Text style={styles.emptyBody}>
              Tap the star on a supply listing to keep it here.
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <Pressable
              key={post.id}
              onPress={() =>
                router.push({ pathname: "/post/[id]", params: { id: post.id } })
              }
              style={styles.row}
            >
              <View style={styles.star}>
                <Ionicons name="star" size={21} color="#F0C53B" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>{post.productName}</Text>
                <Text style={styles.meta}>
                  {post.categoryLabel} · {post.locationLabel}
                </Text>
                <Text style={styles.price}>
                  {post.priceType === "FIXED" && post.price
                    ? `${post.price.toLocaleString()} Birr`
                    : "Contact seller"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8C969E" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topbar: {
    height: 74,
    backgroundColor: "#4F8B2A",
    paddingHorizontal: 18,
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topbarTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  content: { padding: 18 },
  subtitle: {
    color: "#68727C",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  loader: { marginTop: 40 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyTitle: { color: "#222", fontSize: 18, fontWeight: "800", marginTop: 12 },
  emptyBody: {
    color: "#68727C",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  row: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E7",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  star: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF9DF",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  name: { color: "#4F8B2A", fontSize: 16, fontWeight: "800" },
  meta: { color: "#68727C", fontSize: 12, marginTop: 4 },
  price: { color: "#78A633", fontSize: 13, fontWeight: "800", marginTop: 4 },
});
