import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import AuthScreen from "@/app/auth";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { signOut, firebaseAuth } from "@/lib/firebase";
import { getPlatformSettings } from "@/lib/backend/settings";
import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const colors = useColors("light");
  const { session, profile, loading, profileLoading } = useFirebaseAuth();
  const [telebirrNumber, setTelebirrNumber] = useState(""); const [telebirrAccountName, setTelebirrAccountName] = useState("");
  useEffect(() => { if (session && profile?.status !== "ACTIVE") void getPlatformSettings().then((settings) => { setTelebirrNumber(settings.telebirrNumber); setTelebirrAccountName(settings.telebirrAccountName); }).catch(() => undefined); }, [session, profile?.status]);
  if (loading || (session && profileLoading)) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  if (!session) return <AuthScreen />;
  if (profile?.status !== "ACTIVE") return <View style={[styles.pendingRoot, { backgroundColor: colors.background }]}><View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.eyebrow, { color: colors.secondaryDark }]}>ACCOUNT VERIFICATION</Text><Text style={[styles.title, { color: colors.foreground }]}>Your account is pending approval</Text><Text style={[styles.body, { color: colors.muted }]}>SIGLA keeps new accounts pending until an administrator verifies the Telebirr transaction. You will be able to enter your portal as soon as the payment is approved.</Text><View style={[styles.detail, { backgroundColor: colors.secondarySoft }]}><Text style={[styles.detailLabel, { color: colors.secondaryDark }]}>PAY TO</Text><Text style={[styles.detailValue, { color: colors.secondaryDark }]}>{telebirrNumber || "Admin has not configured a number yet"}</Text><Text style={[styles.detailValue, { color: colors.secondaryDark }]}>{telebirrAccountName || "Account holder name will appear here"}</Text></View><Text style={[styles.status, { color: colors.secondaryDark }]}>Current status: {(profile?.status ?? "REGISTERED").replaceAll("_", " ")}</Text><Pressable onPress={() => void signOut(firebaseAuth)} style={styles.signOut}><Text style={[styles.signOutText, { color: colors.error }]}>Sign out</Text></Pressable></View></View>;
  return children;
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center" }, pendingRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }, card: { width: "100%", maxWidth: 560, borderWidth: 1, borderRadius: 20, padding: 28 }, eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4 }, title: { fontSize: 28, fontWeight: "800", marginTop: 10 }, body: { fontSize: 16, lineHeight: 24, marginTop: 14 }, detail: { borderRadius: 14, padding: 18, marginTop: 22 }, detailLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 }, detailValue: { fontSize: 17, fontWeight: "700", marginTop: 6 }, status: { fontSize: 14, fontWeight: "700", marginTop: 18 }, signOut: { alignItems: "center", marginTop: 24, minHeight: 44, justifyContent: "center" }, signOutText: { fontSize: 16, fontWeight: "800" } });
