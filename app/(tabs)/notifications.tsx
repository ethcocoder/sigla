import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@/components/ionicons";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import {
  listConversations,
  type ConversationSummary,
} from "@/lib/backend/messages";
import { router } from "expo-router";

export default function MessagesScreen() {
  const { session } = useFirebaseAuth();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session?.user.id) return;
    setLoading(true);
    try {
      setError(null);
      setItems(await listConversations(session.user.id));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load conversations.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user.id]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>MESSAGES</Text>
        <Ionicons name="create-outline" size={22} color="#FFFFFF" />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={undefined}
      >
        {loading ? (
          <ActivityIndicator color="#2F8BEA" style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={42}
              color="#8C969E"
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyBody}>
              Open a supply listing and tap Message seller to start a private
              conversation.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/messages/chat" as never,
                  params: {
                    conversationId: item.id,
                    otherUserId: item.otherUserId,
                    otherName: item.otherName,
                    listingName: item.listingName,
                  },
                })
              }
              style={styles.thread}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.otherName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.copy}>
                <View style={styles.header}>
                  <Text style={styles.title}>{item.otherName}</Text>
                  <Text style={styles.time}>
                    {item.updatedAt.toLocaleDateString()}
                  </Text>
                </View>
                {item.listingName ? (
                  <Text style={styles.listing} numberOfLines={1}>
                    {item.listingName}
                  </Text>
                ) : null}
                <Text style={styles.body} numberOfLines={2}>
                  {item.lastMessage}
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
    backgroundColor: "#2F8BEA",
    paddingTop: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topbarTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  content: { padding: 18 },
  loader: { marginTop: 40 },
  error: { color: "#B42318", padding: 16, textAlign: "center" },
  empty: { alignItems: "center", paddingTop: 90, paddingHorizontal: 25 },
  emptyTitle: { color: "#222", fontSize: 18, fontWeight: "800", marginTop: 12 },
  emptyBody: {
    color: "#68727C",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 7,
  },
  thread: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E7",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D9F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#2F76BD", fontSize: 19, fontWeight: "900" },
  copy: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title: { color: "#24282C", fontSize: 15, fontWeight: "800", flex: 1 },
  time: { color: "#8A939A", fontSize: 11 },
  listing: { color: "#2F76BD", fontSize: 12, fontWeight: "700", marginTop: 4 },
  body: { color: "#68727C", fontSize: 13, lineHeight: 18, marginTop: 4 },
});
