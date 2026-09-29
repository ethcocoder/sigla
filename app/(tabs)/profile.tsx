import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/brand-lockup";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function ProfileScreen() {
  const colors = useColors("light");
  const { language, setLanguage, t } = useTranslation();
  const { session } = useSupabaseAuth();
  const profileName = session?.user.user_metadata?.name ?? session?.user.email ?? "SIGLA member";
  const profileContact = session?.user.email ?? "Authenticated account";
  const menuItems = [{ icon: "documents-outline" as const, label: t("profile.myPosts") }, { icon: "receipt-outline" as const, label: t("profile.payments") }, { icon: "settings-outline" as const, label: t("profile.settings") }, { icon: "help-circle-outline" as const, label: t("profile.support") }];
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandLockup />
        <Text style={[styles.title, { color: colors.foreground }]}>{t("profile.title")}</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}><Text style={[styles.avatarText, { color: colors.primaryDark }]}>{profileName.charAt(0).toUpperCase()}</Text></View><View style={styles.profileCopy}><Text style={[styles.name, { color: colors.foreground }]}>{profileName}</Text><Text style={[styles.phone, { color: colors.muted }]}>{profileContact}</Text></View><Ionicons name="create-outline" size={21} color={colors.primaryDark} /></View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t("profile.accountStatus")}</Text>
        <View style={[styles.statusCard, { backgroundColor: colors.primarySoft }]}><View><Text style={[styles.statusLabel, { color: colors.primaryDark }]}>{t("profile.active")}</Text><Text style={[styles.statusBody, { color: colors.primaryDark }]}>Your account is ready to discover and connect.</Text></View><Ionicons name="checkmark-circle" size={26} color={colors.primaryDark} /></View>
        <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>{menuItems.map((item) => <Pressable key={item.label} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]} accessibilityRole="button"><Ionicons name={item.icon} size={21} color={colors.muted} /><Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>)}</View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t("profile.language")}</Text>
        <View style={[styles.languageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable onPress={() => setLanguage("en")} style={[styles.language, language === "en" && { backgroundColor: colors.primarySoft }]}><Text style={[styles.languageText, { color: language === "en" ? colors.primaryDark : colors.muted }]}>{t("profile.languageEnglish")}</Text></Pressable><Pressable onPress={() => setLanguage("am")} style={[styles.language, language === "am" && { backgroundColor: colors.primarySoft }]}><Text style={[styles.languageText, { color: language === "am" ? colors.primaryDark : colors.muted }]}>{t("profile.languageAmharic")}</Text></Pressable></View>
        <Pressable onPress={() => { void supabase.auth.signOut(); }} accessibilityRole="button" style={styles.signOut}><Ionicons name="log-out-outline" size={20} color={colors.error} /><Text style={[styles.signOutText, { color: colors.error }]}>Sign out</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.xl, paddingBottom: 36, maxWidth: 720, width: "100%", alignSelf: "center" }, title: { ...Typography.title, marginTop: 42, marginBottom: Spacing.xl }, profileCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg }, avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }, avatarText: { fontSize: 22, fontWeight: "800" }, profileCopy: { flex: 1 }, name: { ...Typography.heading }, phone: { ...Typography.caption, marginTop: 3 }, sectionLabel: { ...Typography.label, textTransform: "uppercase", letterSpacing: 1, marginTop: Spacing.xxl, marginBottom: Spacing.sm }, statusCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: Radii.md, padding: Spacing.lg }, statusLabel: { ...Typography.label, letterSpacing: 1 }, statusBody: { ...Typography.caption, marginTop: 4 }, menu: { borderWidth: 1, borderRadius: Radii.lg, overflow: "hidden" }, menuItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md, minHeight: 58, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }, menuLabel: { ...Typography.body, flex: 1 }, languageCard: { flexDirection: "row", borderWidth: 1, borderRadius: Radii.md, padding: 4, gap: 4 }, language: { flex: 1, alignItems: "center", borderRadius: 10, paddingVertical: Spacing.md }, languageText: { ...Typography.caption, fontWeight: "700" }, signOut: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, minHeight: 48, marginTop: Spacing.xl }, signOutText: { ...Typography.body, fontWeight: "700" }, pressed: { opacity: 0.72 },
});
