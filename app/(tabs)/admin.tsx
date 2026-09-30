import { Ionicons } from "@/components/ionicons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { ActionButton } from "@/components/action-button";
import { BrandLockup } from "@/components/brand-lockup";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { listAdminPayments, listAdminPosts, reviewPayment, reviewPost, getAdminSettings, updateAdminSettings, type AdminPaymentRow, type AdminPostRow } from "@/lib/backend/admin";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

export default function AdminScreen() {
  const colors = useColors("light");
  const { session, isAdmin, loading, profileLoading } = useFirebaseAuth();
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [settings, setSettings] = useState({ registrationFee: "0", postFee: "0", telebirrNumber: "", supportPhone: "", supportTelegram: "", requirePostApproval: true, requireUserApproval: true });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!isAdmin) return;
    if (refresh) setRefreshing(true); else setLoadingData(true);
    try {
      setError(null);
      const [nextPosts, nextPayments, nextSettings] = await Promise.all([listAdminPosts(), listAdminPayments(), getAdminSettings()]);
      setPosts(nextPosts);
      setPayments(nextPayments);
      setSettings({ registrationFee: String(nextSettings.registration_fee ?? 0), postFee: String(nextSettings.post_fee ?? 0), telebirrNumber: nextSettings.telebirr_number ?? "", supportPhone: nextSettings.support_phone ?? "", supportTelegram: nextSettings.support_telegram ?? "", requirePostApproval: nextSettings.require_post_approval, requireUserApproval: nextSettings.require_user_approval });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load admin data.");
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);

  if (loading || profileLoading || loadingData) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /><Text style={[styles.loadingText, { color: colors.muted }]}>Loading administrator workspace…</Text></View>;
  if (!isAdmin || !session) return <View style={[styles.loading, { backgroundColor: colors.background }]}><Ionicons name="shield-outline" size={38} color={colors.muted} /><Text style={[styles.loadingText, { color: colors.foreground }]}>Administrator access required.</Text><ActionButton label="Back to marketplace" compact onPress={() => router.replace("/(tabs)")} /></View>;

  const actOnPost = async (post: AdminPostRow, status: "APPROVED" | "REJECTED") => {
    setBusyId(post.id); setError(null); setMessage(null);
    try { await reviewPost({ id: post.id, status, adminId: session.user.id }); setPosts((current) => current.filter((item) => item.id !== post.id)); setMessage(`Listing ${status === "APPROVED" ? "approved" : "rejected"}.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to review listing."); }
    finally { setBusyId(null); }
  };

  const actOnPayment = async (payment: AdminPaymentRow, status: "VERIFIED" | "REJECTED") => {
    setBusyId(payment.id); setError(null); setMessage(null);
    try { await reviewPayment({ id: payment.id, status, adminId: session.user.id }); setPayments((current) => current.filter((item) => item.id !== payment.id)); setMessage(`Payment ${status === "VERIFIED" ? "verified" : "rejected"}.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to review payment."); }
    finally { setBusyId(null); }
  };

  const saveSettings = async () => {
    setSavingSettings(true); setError(null); setMessage(null);
    try { await updateAdminSettings({ registrationFee: Number(settings.registrationFee) || 0, postFee: Number(settings.postFee) || 0, telebirrNumber: settings.telebirrNumber, supportPhone: settings.supportPhone, supportTelegram: settings.supportTelegram, requirePostApproval: settings.requirePostApproval, requireUserApproval: settings.requireUserApproval }); setMessage("Platform settings saved. New registrations will see the updated Telebirr details immediately."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save settings."); }
    finally { setSavingSettings(false); }
  };

  return <View style={[styles.root, { backgroundColor: colors.background }]}><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />} contentContainerStyle={styles.content}><BrandLockup /><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primaryDark }]}>ADMINISTRATION</Text><Text style={[styles.title, { color: colors.foreground }]}>SIGLA control center</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Review marketplace activity, confirm Telebirr payments, and manage live settings.</Text></View><View style={[styles.adminBadge, { backgroundColor: colors.primarySoft }]}><Ionicons name="shield-checkmark" size={18} color={colors.primaryDark} /><Text style={[styles.adminBadgeText, { color: colors.primaryDark }]}>ADMIN</Text></View></View>{error ? <View style={[styles.alert, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}><Text style={[styles.alertText, { color: colors.error }]}>{error}</Text></View> : null}{message ? <View style={[styles.alert, { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }]}><Text style={[styles.alertText, { color: colors.primaryDark }]}>{message}</Text></View> : null}<View style={styles.stats}><Stat label="Listings to review" value={String(posts.length)} colors={colors} /><Stat label="Payments pending" value={String(payments.length)} colors={colors} /><Stat label="Workspace" value="Live" colors={colors} /></View><Section title="Listing moderation" colors={colors}>{posts.length === 0 ? <Empty label="No listings are waiting for review." colors={colors} /> : posts.map((post) => <View key={post.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.cardHeader}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{post.product_name}</Text><Text style={[styles.tag, { color: colors.primaryDark, backgroundColor: colors.primarySoft }]}>{post.status.replaceAll("_", " ")}</Text></View><Text style={[styles.cardMeta, { color: colors.muted }]}>{post.type} · {post.category_label || "Other"} · {post.quantity} {post.unit} · {post.location_label}</Text><Text style={[styles.cardBody, { color: colors.foreground }]} numberOfLines={3}>{post.description}</Text><Text style={[styles.cardMeta, { color: colors.muted }]}>Submitted by {post.profiles?.name || "SIGLA member"} · {post.profiles?.phone || "No phone"}</Text><View style={styles.actions}><ActionButton label={busyId === post.id ? "Working…" : "Approve"} compact disabled={busyId !== null} onPress={() => void actOnPost(post, "APPROVED")} /><ActionButton label="Reject" compact variant="outline" disabled={busyId !== null} onPress={() => void actOnPost(post, "REJECTED")} /></View></View>)}</Section><Section title="Telebirr payment review" colors={colors}>{payments.length === 0 ? <Empty label="No pending payments." colors={colors} /> : payments.map((payment) => <View key={payment.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.cardHeader}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{payment.type === "REGISTRATION" ? "Registration payment" : "Listing payment"}</Text><Text style={[styles.amount, { color: colors.primaryDark }]}>{Number(payment.amount).toLocaleString()} ETB</Text></View><Text style={[styles.cardBody, { color: colors.foreground }]}>Transaction: {payment.transaction_reference}</Text><Text style={[styles.cardMeta, { color: colors.muted }]}>Sender: {payment.sender_phone} · {payment.profiles?.name || "SIGLA member"}</Text><View style={styles.actions}><ActionButton label="Verify payment" compact disabled={busyId !== null} onPress={() => void actOnPayment(payment, "VERIFIED")} /><ActionButton label="Reject" compact variant="outline" disabled={busyId !== null} onPress={() => void actOnPayment(payment, "REJECTED")} /></View></View>)}</Section><Section title="Live platform settings" colors={colors}><View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Field label="Registration fee (ETB)" value={settings.registrationFee} onChangeText={(value) => setSettings((current) => ({ ...current, registrationFee: value }))} keyboardType="numeric" colors={colors} /><Field label="Listing fee (ETB)" value={settings.postFee} onChangeText={(value) => setSettings((current) => ({ ...current, postFee: value }))} keyboardType="numeric" colors={colors} /><Field label="Telebirr phone number" value={settings.telebirrNumber} onChangeText={(value) => setSettings((current) => ({ ...current, telebirrNumber: value }))} keyboardType="phone-pad" colors={colors} /><Field label="Support phone" value={settings.supportPhone} onChangeText={(value) => setSettings((current) => ({ ...current, supportPhone: value }))} keyboardType="phone-pad" colors={colors} /><Field label="Support Telegram" value={settings.supportTelegram} onChangeText={(value) => setSettings((current) => ({ ...current, supportTelegram: value }))} colors={colors} /><Toggle label="Require listing approval" value={settings.requirePostApproval} onPress={() => setSettings((current) => ({ ...current, requirePostApproval: !current.requirePostApproval }))} colors={colors} /><Toggle label="Require user approval" value={settings.requireUserApproval} onPress={() => setSettings((current) => ({ ...current, requireUserApproval: !current.requireUserApproval }))} colors={colors} /><ActionButton label={savingSettings ? "Saving…" : "Save live settings"} disabled={savingSettings} onPress={() => void saveSettings()} /></View></Section></ScrollView></View>;
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) { return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>{children}</View>; }
function Empty({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="checkmark-done-outline" size={24} color={colors.primary} /><Text style={[styles.emptyText, { color: colors.muted }]}>{label}</Text></View>; }
function Stat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text></View>; }
function Field({ label, value, onChangeText, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: "numeric" | "phone-pad"; colors: ReturnType<typeof useColors> }) { return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>; }
function Toggle({ label, value, onPress, colors }: { label: string; value: boolean; onPress: () => void; colors: ReturnType<typeof useColors> }) { return <Text onPress={onPress} style={[styles.toggle, { color: value ? colors.primaryDark : colors.muted, backgroundColor: value ? colors.primarySoft : colors.background, borderColor: value ? colors.primarySoft : colors.border }]}>{value ? "✓" : "○"}  {label}</Text>; }

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingTop: Spacing.xl, paddingBottom: 56, maxWidth: 860, width: "100%", alignSelf: "center" }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md, padding: Spacing.xl }, loadingText: { ...Typography.body, textAlign: "center" }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.xl }, eyebrow: { ...Typography.label, letterSpacing: 1.4 }, title: { ...Typography.title, marginTop: 4 }, subtitle: { ...Typography.body, lineHeight: 22, marginTop: Spacing.sm, maxWidth: 560 }, adminBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: Radii.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, adminBadgeText: { ...Typography.caption, fontWeight: "800", letterSpacing: 1 }, alert: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md }, alertText: { ...Typography.caption, lineHeight: 18 }, stats: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.xl }, stat: { flex: 1, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md }, statValue: { ...Typography.title, fontSize: 23 }, statLabel: { ...Typography.caption, marginTop: 3 }, section: { marginTop: Spacing.xl }, sectionTitle: { ...Typography.heading, marginBottom: Spacing.md }, card: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.lg, marginBottom: Spacing.md }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: Spacing.md }, cardTitle: { ...Typography.heading, flex: 1 }, tag: { ...Typography.caption, fontWeight: "800", borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4 }, amount: { ...Typography.body, fontWeight: "800" }, cardMeta: { ...Typography.caption, lineHeight: 18, marginTop: 6 }, cardBody: { ...Typography.body, lineHeight: 20, marginTop: Spacing.md }, actions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg }, empty: { minHeight: 96, borderWidth: 1, borderRadius: Radii.md, justifyContent: "center", alignItems: "center", gap: Spacing.sm, padding: Spacing.lg }, emptyText: { ...Typography.body, textAlign: "center" }, settingsCard: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.lg }, field: { marginBottom: Spacing.md }, label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm }, input: { minHeight: 48, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, ...Typography.body }, toggle: { ...Typography.body, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm }, });
