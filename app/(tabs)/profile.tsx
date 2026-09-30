import { Ionicons } from "@/components/ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandLockup } from "@/components/brand-lockup";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { statusLabel } from "@/lib/backend/profile";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { firebaseAuth, signOut } from "@/lib/firebase";
export default function ProfileScreen() {
  const colors = useColors("light");
  const { language, setLanguage, t } = useTranslation();
  const { session, profile, isAdmin, profileLoading } = useFirebaseAuth();
  const profileName =
    profile?.name ||
    session?.user.user_metadata?.name ||
    session?.user.email ||
    "SIGLA member";
  const profileContact =
    profile?.phone || session?.user.email || "Authenticated account";
  const accountStatus = profile?.status
    ? statusLabel(profile.status)
    : profileLoading
      ? "Loading"
      : "Registered";
  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }[] = [
    {
      icon: "document-text-outline",
      label: t("profile.myPosts"),
      onPress: () => router.push("/(tabs)/my-posts" as never),
    },
    {
      icon: "receipt-outline",
      label: t("profile.payments"),
      onPress: () => router.push("/(tabs)/notifications"),
    },
    {
      icon: "settings-outline",
      label: t("profile.settings"),
      onPress: () => router.push("/settings" as never),
    },
    {
      icon: "help-circle-outline",
      label: t("profile.support"),
      onPress: () => router.push("/support" as never),
    },
  ];
  const statusIcon: keyof typeof Ionicons.glyphMap =
    profile?.status === "ACTIVE" ? "checkmark-circle" : "time-outline";
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <BrandLockup />
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("profile.title")}
        </Text>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.avatar, { backgroundColor: colors.primarySoft }]}
          >
            <Text style={[styles.avatarText, { color: colors.primaryDark }]}>
              {profileName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {profileName}
            </Text>
            <Text style={[styles.phone, { color: colors.muted }]}>
              {profileContact}
            </Text>
            {isAdmin ? (
              <Text style={[styles.role, { color: colors.primaryDark }]}>
                Administrator
              </Text>
            ) : null}
          </View>
          <Ionicons name="checkmark-circle" size={21} color={colors.primary} />
        </View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>
          {t("profile.accountStatus")}
        </Text>
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                profile?.status === "ACTIVE"
                  ? colors.primarySoft
                  : colors.secondarySoft,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.statusLabel,
                {
                  color:
                    profile?.status === "ACTIVE"
                      ? colors.primaryDark
                      : colors.secondaryDark,
                },
              ]}
            >
              {accountStatus.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.statusBody,
                {
                  color:
                    profile?.status === "ACTIVE"
                      ? colors.primaryDark
                      : colors.secondaryDark,
                },
              ]}
            >
              {profile?.status === "ACTIVE"
                ? "Your account is ready to discover and connect."
                : "Your account is waiting for payment verification."}
            </Text>
          </View>
          <Ionicons
            name={statusIcon}
            size={26}
            color={
              profile?.status === "ACTIVE"
                ? colors.primaryDark
                : colors.secondaryDark
            }
          />
        </View>
        {isAdmin ? (
          <Pressable
            onPress={() => router.push("/(tabs)/admin")}
            style={[styles.adminCard, { backgroundColor: colors.primaryDark }]}
          >
            <View style={styles.adminIcon}>
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={colors.primaryDark}
              />
            </View>
            <View style={styles.adminCopy}>
              <Text style={styles.adminTitle}>Open admin control center</Text>
              <Text style={styles.adminBody}>
                Review listings, verify Telebirr payments, and manage live
                settings.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <View
          style={[
            styles.menu,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={item.icon} size={21} color={colors.muted} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>
          {t("profile.language")}
        </Text>
        <View
          style={[
            styles.languageCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => setLanguage("en")}
            style={[
              styles.language,
              language === "en" && { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color: language === "en" ? colors.primaryDark : colors.muted,
                },
              ]}
            >
              {t("profile.languageEnglish")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("am")}
            style={[
              styles.language,
              language === "am" && { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color: language === "am" ? colors.primaryDark : colors.muted,
                },
              ]}
            >
              {t("profile.languageAmharic")}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            void signOut(firebaseAuth);
          }}
          style={styles.signOut}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.xl,
    paddingBottom: 36,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  title: { ...Typography.title, marginTop: 42, marginBottom: Spacing.xl },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800" },
  profileCopy: { flex: 1 },
  name: { ...Typography.heading },
  phone: { ...Typography.caption, marginTop: 3 },
  role: { ...Typography.caption, fontWeight: "700", marginTop: 4 },
  sectionLabel: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radii.md,
    padding: Spacing.lg,
  },
  statusLabel: { ...Typography.label, letterSpacing: 1 },
  statusBody: { ...Typography.caption, marginTop: 4 },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  adminIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
  },
  adminCopy: { flex: 1 },
  adminTitle: { ...Typography.body, color: "#FFFFFF", fontWeight: "800" },
  adminBody: {
    ...Typography.caption,
    color: "#DCFCE7",
    lineHeight: 17,
    marginTop: 3,
  },
  menu: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    overflow: "hidden",
    marginTop: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 58,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  menuLabel: { ...Typography.body, flex: 1 },
  languageCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: 4,
    gap: 4,
  },
  language: {
    flex: 1,
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: Spacing.md,
  },
  languageText: { ...Typography.caption, fontWeight: "700" },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    minHeight: 48,
    marginTop: Spacing.xl,
  },
  signOutText: { ...Typography.body, fontWeight: "700" },
  pressed: { opacity: 0.72 },
});
