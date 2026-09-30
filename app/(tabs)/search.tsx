import { Ionicons } from "@/components/ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { FilterChip } from "@/components/filter-chip";
import { MarketplaceCard } from "@/components/marketplace-card";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { getSafeErrorMessage } from "@/lib/error-message";
import { useTranslation } from "@/lib/i18n-provider";
import { listApprovedPosts } from "@/lib/backend/marketplace";
import type { MarketplacePost, PostType } from "@/types/domain";

export default function SearchScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PostType | "ALL">("ALL");
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setError(null); setPosts(await listApprovedPosts({ type: type === "ALL" ? undefined : type, limit: 30 })); }
    catch (cause) { setError(getSafeErrorMessage(cause, "network")); }
    finally { setLoading(false); }
  }, [type]);
  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => !normalized || [post.productName, post.categoryLabel, post.locationLabel, post.description].some((value) => value.toLowerCase().includes(normalized)));
  }, [posts, query]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("search.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t("home.subtitle")}</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="search-outline" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder={t("search.placeholder")} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} returnKeyType="search" accessibilityLabel={t("search.placeholder")} /></View>
        <View style={styles.filterHeader}><Text style={[styles.filterTitle, { color: colors.foreground }]}>{t("search.filters")}</Text><Ionicons name="options-outline" size={18} color={colors.muted} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}><FilterChip label={t("search.all")} active={type === "ALL"} onPress={() => setType("ALL")} /><FilterChip label={t("post.have")} active={type === "HAVE"} onPress={() => setType("HAVE")} /><FilterChip label={t("post.need")} active={type === "NEED"} onPress={() => setType("NEED")} /></ScrollView>
        {error ? <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View> : null}
        <Text style={[styles.resultCount, { color: colors.muted }]}>{results.length} {results.length === 1 ? "listing" : "listings"}</Text>
        {loading && results.length === 0 ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : results.length === 0 ? <EmptyState title={t("search.noResults")} body={t("search.noResultsBody")} icon="search-outline" /> : results.map((post) => <MarketplaceCard key={post.id} post={post} onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.xl, paddingBottom: 32, maxWidth: 720, width: "100%", alignSelf: "center" }, title: { ...Typography.title }, subtitle: { ...Typography.body, marginTop: 4, marginBottom: Spacing.xl }, searchBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, minHeight: 52, paddingHorizontal: Spacing.lg }, input: { flex: 1, ...Typography.body, paddingVertical: 0 }, filterHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.xxl, marginBottom: Spacing.sm }, filterTitle: { ...Typography.heading, fontSize: 15 }, filters: { gap: Spacing.sm, paddingVertical: 2 }, errorBox: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.lg }, errorText: { ...Typography.caption, lineHeight: 18 }, resultCount: { ...Typography.caption, marginTop: Spacing.xl, marginBottom: Spacing.md }, loader: { marginVertical: Spacing.xxl },
});
