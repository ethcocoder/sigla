import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/i18n-provider";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

export default function SettingsScreen() {
  const colors = useColors("light");
  const { language, setLanguage, t } = useTranslation();
  const { profile } = useFirebaseAuth();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="close" size={25} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.primaryDark }]}>
          {t("common.account")}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("common.settings")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {language === "am" ? "የSIGLA ምርጫዎችዎን ያስተዳድሩ።" : language === "om" ? "Filannoo SIGLA kee bulchi." : "Manage your SIGLA preferences."}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.muted }]}>
            {language === "am" ? "የመለያ ስም" : language === "om" ? "Maqaa herregaa" : "Account name"}
          </Text>
          <Text style={[styles.value, { color: colors.foreground }]}>
            {profile?.name || "SIGLA member"}
          </Text>
          <Text style={[styles.label, { color: colors.muted, marginTop: 16 }]}>
            {language === "am" ? "የመለያ ስልክ" : language === "om" ? "Bilbila herregaa" : "Account phone"}
          </Text>
          <Text style={[styles.value, { color: colors.foreground }]}>
            {profile?.phone || "Not provided"}
          </Text>
        </View>
        <Text style={[styles.section, { color: colors.muted }]}>{t("profile.language")}</Text>
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
          <Pressable
            onPress={() => setLanguage("om")}
            style={[
              styles.language,
              language === "om" && { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text
              style={[
                styles.languageText,
                { color: language === "om" ? colors.primaryDark : colors.muted },
              ]}
            >
              {t("profile.languageOromo")}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.note, { backgroundColor: colors.primarySoft }]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color={colors.primaryDark}
          />
          <Text style={[styles.noteText, { color: colors.primaryDark }]}>
            {language === "am"
              ? "የመለያዎ ሁኔታ እና የክፍያ ማረጋገጫ በSIGLA አስተዳዳሪዎች በደህንነት ይተዳደራል።"
              : language === "om"
                ? "Haalli herregaa fi mirkaneessi kaffaltii kee bulchitoota SIGLA tiin nageenyaan bulu."
                : "Your account status and payment verification are managed securely by SIGLA administrators."}
          </Text>
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
  subtitle: { ...Typography.body, marginTop: 6, marginBottom: Spacing.xl },
  card: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg },
  label: { ...Typography.caption, fontWeight: "700" },
  value: { ...Typography.body, marginTop: 5 },
  section: {
    ...Typography.label,
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
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
  note: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  noteText: { ...Typography.caption, flex: 1, lineHeight: 18 },
});
