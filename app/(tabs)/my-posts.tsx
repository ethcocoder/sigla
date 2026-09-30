import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@/components/ionicons";
import { ActionButton } from "@/components/action-button";
import { EmptyState } from "@/components/empty-state";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import {
  deleteUserPost,
  submitPostForApproval,
} from "@/lib/backend/marketplace";
import { listUserPosts } from "@/lib/backend/profile";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

export default function MyPostsScreen() {
  const colors = useColors("light");
  const { session } = useFirebaseAuth();
  const userId = session?.user.id;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setPosts(await listUserPosts(userId));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load your listings.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const remove = (id: string) => {
    Alert.alert(
      "Delete listing?",
      "This listing will be permanently removed from your portal.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusyId(id);
            try {
              await deleteUserPost(id);
              setPosts((items) => items.filter((item) => item.id !== id));
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Unable to delete the listing.",
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };
  const submit = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await submitPostForApproval(id);
      setPosts((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: "PENDING_REVIEW" } : item,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to send the listing for approval.",
      );
    } finally {
      setBusyId(null);
    }
  };
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>
              YOUR PORTAL
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              My posts
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Manage every listing you own from one place.
            </Text>
          </View>
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
        {!loading && posts.length === 0 ? (
          <EmptyState
            title="No listings yet"
            body="Create a listing and it will appear here for editing and approval tracking."
            icon="document-text-outline"
          />
        ) : (
          posts.map((post) => {
            const status = String(post.status ?? "DRAFT");
            const canSubmit = ["DRAFT", "REJECTED"].includes(status);
            return (
              <View
                key={post.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardCopy}>
                    <Text
                      style={[styles.cardTitle, { color: colors.foreground }]}
                    >
                      {post.productName}
                    </Text>
                    <Text style={[styles.meta, { color: colors.muted }]}>
                      {post.type} · {post.quantity} {post.unit} ·{" "}
                      {post.locationLabel}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.status,
                      {
                        color:
                          status === "APPROVED"
                            ? colors.primaryDark
                            : colors.secondaryDark,
                        backgroundColor:
                          status === "APPROVED"
                            ? colors.primarySoft
                            : colors.secondarySoft,
                      },
                    ]}
                  >
                    {status.replaceAll("_", " ")}
                  </Text>
                </View>
                <Text
                  style={[styles.description, { color: colors.muted }]}
                  numberOfLines={3}
                >
                  {post.description}
                </Text>
                {post.rejectionReason ? (
                  <Text style={[styles.rejection, { color: colors.error }]}>
                    Reason: {post.rejectionReason}
                  </Text>
                ) : null}
                <View style={styles.actions}>
                  <ActionButton
                    label="Edit"
                    compact
                    variant="outline"
                    disabled={busyId === post.id}
                    onPress={() =>
                      router.push({
                        pathname: "/post/new",
                        params: { id: post.id, type: post.type },
                      })
                    }
                  />
                  {canSubmit ? (
                    <ActionButton
                      label="Send for approval"
                      compact
                      disabled={busyId === post.id}
                      onPress={() => void submit(post.id)}
                    />
                  ) : null}
                  <Pressable
                    onPress={() => remove(post.id)}
                    disabled={busyId === post.id}
                    style={styles.delete}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: Spacing.page,
    paddingBottom: 48,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  back: { width: 42, height: 42, justifyContent: "center" },
  headerCopy: { flex: 1 },
  eyebrow: { ...Typography.label, letterSpacing: 1.4 },
  title: { ...Typography.title, marginTop: 4 },
  subtitle: { ...Typography.body, lineHeight: 22, marginTop: 5 },
  error: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  cardCopy: { flex: 1 },
  cardTitle: { ...Typography.heading },
  meta: { ...Typography.caption, marginTop: 5 },
  status: {
    ...Typography.caption,
    fontWeight: "800",
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  description: { ...Typography.body, lineHeight: 20, marginTop: Spacing.md },
  rejection: { ...Typography.caption, lineHeight: 18, marginTop: Spacing.sm },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  delete: {
    width: 42,
    height: 42,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
});
