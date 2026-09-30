import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@/components/ionicons";
import { useColors } from "@/hooks/use-colors";
import { getPlatformSettings } from "@/lib/backend/settings";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

export default function SupportScreen() {
  const colors = useColors("light");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  useEffect(() => {
    void getPlatformSettings()
      .then((settings) => {
        setPhone(settings.supportPhone || "");
        setTelegram(settings.supportTelegram || "");
      })
      .catch(() => undefined);
  }, []);
  const open = (url: string) => {
    void Linking.openURL(url).catch(() => undefined);
  };
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="close" size={25} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>
          HELP CENTER
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Support
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Need help with verification, payments, or a listing? Contact the SIGLA
          support team.
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            How can we help?
          </Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            Include your account phone number, transaction number, and a short
            description so we can help quickly.
          </Text>
          {phone ? (
            <Pressable
              onPress={() => open(`tel:${phone}`)}
              style={[styles.contact, { borderColor: colors.border }]}
            >
              <Ionicons
                name="call-outline"
                size={21}
                color={colors.primaryDark}
              />
              <View style={styles.contactCopy}>
                <Text style={[styles.contactLabel, { color: colors.muted }]}>
                  Call support
                </Text>
                <Text
                  style={[styles.contactValue, { color: colors.foreground }]}
                >
                  {phone}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
          {telegram ? (
            <Pressable
              onPress={() =>
                open(
                  telegram.startsWith("http")
                    ? telegram
                    : `https://t.me/${telegram.replace(/^@/, "")}`,
                )
              }
              style={[styles.contact, { borderColor: colors.border }]}
            >
              <Ionicons
                name="paper-plane-outline"
                size={21}
                color={colors.primaryDark}
              />
              <View style={styles.contactCopy}>
                <Text style={[styles.contactLabel, { color: colors.muted }]}>
                  Telegram support
                </Text>
                <Text
                  style={[styles.contactValue, { color: colors.foreground }]}
                >
                  {telegram}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
          {!phone && !telegram ? (
            <Text style={[styles.empty, { color: colors.muted }]}>
              Support contact details have not been configured yet. Please check
              again later.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: Spacing.page,
    paddingTop: 22,
    paddingBottom: 40,
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
  },
  back: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { ...Typography.label, letterSpacing: 1.4, marginTop: 22 },
  title: { ...Typography.title, marginTop: 5 },
  subtitle: {
    ...Typography.body,
    lineHeight: 23,
    marginTop: 6,
    marginBottom: Spacing.xl,
  },
  card: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg },
  cardTitle: { ...Typography.heading },
  cardBody: {
    ...Typography.body,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: Spacing.md,
  },
  contact: {
    minHeight: 66,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  contactCopy: { flex: 1 },
  contactLabel: { ...Typography.caption },
  contactValue: { ...Typography.body, fontWeight: "700", marginTop: 3 },
  empty: { ...Typography.body, lineHeight: 22, marginTop: 12 },
});
