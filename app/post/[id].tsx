import { Ionicons } from "@/components/ionicons";
import { Image } from "expo-image";
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
import { getPostById } from "@/lib/backend/marketplace";
import { showContactOptions } from "@/lib/contact";
import type { MarketplacePost } from "@/types/domain";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [post, setPost] = useState<MarketplacePost | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (id)
      void getPostById(id)
        .then(setPost)
        .catch((cause) =>
          setError(
            cause instanceof Error ? cause.message : "Listing not found.",
          ),
        );
  }, [id]);
  if (!post && !error)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4F8B2A" />
      </View>
    );
  if (!post)
    return (
      <View style={styles.center}>
        <Text>{error ?? "Listing not found."}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  const price =
    post.priceType === "FIXED" && post.price != null
      ? `${post.price.toLocaleString()} Birr`
      : post.priceType === "NEGOTIABLE"
        ? "Negotiable"
        : "Contact seller";
  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topbarTitle} numberOfLines={1}>
          {post.productName}
        </Text>
        <Ionicons name="flag-outline" size={22} color="#FFFFFF" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="image-outline" size={46} color="#9AA3AB" />
          </View>
        )}
        <View style={styles.seenRow}>
          <Text style={styles.seen}>Agricultural supply</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from watchlist" : "Save to watchlist"
            }
            onPress={() => setSaved((current) => !current)}
            hitSlop={8}
          >
            <Ionicons
              name={saved ? "star" : "star-outline"}
              size={25}
              color={saved ? "#E2B735" : "#222"}
            />
          </Pressable>
        </View>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.title}>{post.productName}</Text>
        <Text style={styles.subTitle}>
          {post.categoryLabel} ·{" "}
          {post.type === "HAVE"
            ? "Available from supplier"
            : "Wanted by farmer"}
        </Text>
        <View style={styles.details}>
          <Detail label="Quantity" value={`${post.quantity} ${post.unit}`} />
          <Detail label="Location" value={post.locationLabel} />
          <Detail label="Seller" value={post.poster.name} />
        </View>
        <Text style={styles.description}>{post.description}</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => showContactOptions(post)}
            style={styles.action}
          >
            <Ionicons name="call-outline" size={20} color="#222" />
            <Text style={styles.actionText}>CALL SELLER</Text>
          </Pressable>
          <Pressable
            onPress={() =>
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
            style={styles.action}
          >
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#222" />
            <Text style={styles.actionText}>MESSAGE SELLER</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
  topbar: {
    height: 74,
    backgroundColor: "#4F8B2A",
    paddingTop: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topbarTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    maxWidth: "72%",
  },
  content: { paddingBottom: 35 },
  image: { width: "100%", height: 320, backgroundColor: "#F0F2F3" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  seenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  seen: { color: "#68727C", fontSize: 13 },
  price: {
    color: "#4F8B2A",
    fontSize: 27,
    fontWeight: "900",
    paddingHorizontal: 16,
    marginTop: 3,
  },
  title: {
    color: "#202326",
    fontSize: 19,
    fontWeight: "800",
    paddingHorizontal: 16,
    marginTop: 7,
  },
  subTitle: {
    color: "#68727C",
    fontSize: 14,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 17,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E3E6",
  },
  detail: { flex: 1 },
  detailLabel: { color: "#8A939A", fontSize: 11, fontWeight: "700" },
  detailValue: {
    color: "#292D31",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },
  description: {
    color: "#343A40",
    fontSize: 15,
    lineHeight: 23,
    paddingHorizontal: 16,
    paddingTop: 17,
  },
  actions: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 16,
    marginTop: 25,
  },
  action: {
    flex: 1,
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E6D23B",
    backgroundColor: "#DDF0C8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionText: { color: "#1D2226", fontSize: 12, fontWeight: "900" },
  backText: { color: "#4F8B2A", fontWeight: "800" },
});
