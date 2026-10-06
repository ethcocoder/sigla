import { Ionicons } from "@/components/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { firebaseAuth } from "@/lib/firebase";
import {
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  type ChatMessage,
} from "@/lib/backend/messages";

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    conversationId?: string;
    otherUserId?: string;
    otherName?: string;
    listingId?: string;
    listingName?: string;
  }>();
  const [conversationId, setConversationId] = useState(
    params.conversationId ?? "",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = firebaseAuth.currentUser?.uid ?? "";
  const otherName = params.otherName || "SIGLA member";

  useEffect(() => {
    let cancelled = false;
    const open = async () => {
      try {
        const id =
          params.conversationId ||
          (params.otherUserId
            ? await getOrCreateConversation({
                otherUserId: params.otherUserId,
                otherName,
                listingId: params.listingId,
                listingName: params.listingName,
              })
            : "");
        if (!id) throw new Error("This conversation is not available.");
        if (!cancelled) setConversationId(id);
      } catch (cause) {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to open conversation.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void open();
    return () => {
      cancelled = true;
    };
  }, [
    otherName,
    params.conversationId,
    params.listingId,
    params.listingName,
    params.otherUserId,
  ]);

  useEffect(() => {
    if (!conversationId) return;
    return subscribeToMessages(conversationId, setMessages, (cause) =>
      setError(cause.message),
    );
  }, [conversationId]);

  const receiverId = useMemo(
    () => params.otherUserId || "",
    [params.otherUserId],
  );
  const submit = async () => {
    if (!conversationId || !receiverId || !text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(conversationId, receiverId, text);
      setText("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topbarCopy}>
          <Text style={styles.topbarTitle}>{otherName}</Text>
          <Text style={styles.online}>SIGLA marketplace chat</Text>
        </View>
      </View>
      {params.listingName ? (
        <View style={styles.listingBar}>
          <Ionicons name="pricetag-outline" size={17} color="#4F8B2A" />
          <Text style={styles.listingText} numberOfLines={1}>
            {params.listingName}
          </Text>
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator color="#4F8B2A" style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={38}
                color="#9AA3AB"
              />
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptyBody}>
                Ask about availability, price, delivery, or safe use of the
                agricultural supply.
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  message.senderId === currentUserId
                    ? styles.mine
                    : styles.theirs,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    message.senderId === currentUserId && styles.mineText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.time,
                    message.senderId === currentUserId && styles.mineTime,
                  ]}
                >
                  {message.createdAt.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      )}
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor="#8A939A"
          style={styles.input}
          multiline
          maxLength={1000}
        />
        <Pressable
          disabled={sending || !text.trim()}
          onPress={() => void submit()}
          style={[
            styles.send,
            (sending || !text.trim()) && styles.sendDisabled,
          ]}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F5F6" },
  topbar: {
    minHeight: 74,
    backgroundColor: "#4F8B2A",
    paddingTop: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  topbarCopy: { flex: 1 },
  topbarTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  online: { color: "#E6F3D8", fontSize: 11, marginTop: 3 },
  listingBar: {
    minHeight: 42,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E3E6",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listingText: { color: "#4F8B2A", fontSize: 13, fontWeight: "800", flex: 1 },
  loader: { marginTop: 35 },
  messages: {
    padding: 15,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: 9,
  },
  empty: { alignItems: "center", paddingHorizontal: 35, paddingVertical: 90 },
  emptyTitle: { color: "#222", fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyBody: {
    color: "#68727C",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#DDF0C8",
    borderBottomRightRadius: 5,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
  },
  bubbleText: { color: "#252A2E", fontSize: 15, lineHeight: 21 },
  mineText: { color: "#315D1D" },
  time: { color: "#8A939A", fontSize: 10, marginTop: 5, textAlign: "right" },
  mineTime: { color: "#6E9A4C" },
  error: { color: "#B42318", fontSize: 12, textAlign: "center", padding: 8 },
  composer: {
    minHeight: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DDE1E5",
    padding: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    minHeight: 44,
    backgroundColor: "#F1F3F4",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: "#252A2E",
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F8B2A",
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.45 },
});
