import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/brand-lockup";
import { PostTypeCard } from "@/components/post-type-card";
import { useColors } from "@/hooks/use-colors";
import { Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";

export default function CreateScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <BrandLockup />
        <Text style={[styles.title, { color: colors.foreground }]}>{t("create.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t("create.subtitle")}</Text>
        <PostTypeCard type="HAVE" body={t("create.haveBody")} onPress={() => router.push({ pathname: "/post/new", params: { type: "HAVE" } })} />
        <PostTypeCard type="NEED" body={t("create.needBody")} onPress={() => router.push({ pathname: "/post/new", params: { type: "NEED" } })} />
        <View style={[styles.note, { backgroundColor: colors.primarySoft }]}><Text style={[styles.noteTitle, { color: colors.primaryDark }]}>Your post, moderated with care</Text><Text style={[styles.noteBody, { color: colors.primaryDark }]}>Every community listing is reviewed before it appears in the public feed.</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.xl, maxWidth: 720, width: "100%", alignSelf: "center" }, title: { ...Typography.title, marginTop: 42 }, subtitle: { ...Typography.body, marginTop: Spacing.sm, marginBottom: Spacing.xxl }, note: { borderRadius: 16, padding: Spacing.lg, marginTop: Spacing.md }, noteTitle: { ...Typography.heading, fontSize: 15 }, noteBody: { ...Typography.caption, lineHeight: 18, marginTop: 4 },
});
