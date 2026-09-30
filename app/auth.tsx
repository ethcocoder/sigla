import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ActionButton } from "@/components/action-button";
import { BrandLockup } from "@/components/brand-lockup";
import { useColors } from "@/hooks/use-colors";
import { getPlatformSettings } from "@/lib/backend/settings";
import { submitRegistrationPayment } from "@/lib/backend/payments";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/firebase";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import type { MarketplaceSettings } from "@/types/domain";

export default function AuthScreen() {
  const colors = useColors("light");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [transactionReference, setTransactionReference] = useState("");
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void getPlatformSettings().then(setSettings).catch(() => undefined); }, []);
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      if (!email.trim()) throw new Error("Enter your email address.");
      if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
      if (mode === "signUp") {
        if (name.trim().length < 2) throw new Error("Enter your name to create an account.");
        if (phone.trim().length < 7) throw new Error("Enter a valid sender phone number.");
        if (!transactionReference.trim()) throw new Error("Enter the Telebirr transaction number.");
        await signUpWithEmail(email, password, name, phone);
        await submitRegistrationPayment({ amount: settings?.registrationFee ?? 0, senderPhone: phone, transactionReference, accountHolderName: settings?.telebirrAccountName || "SIGLA administrator" });
      } else await signInWithEmail(email, password);
      router.replace("/(tabs)");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to authenticate. Please try again."); } finally { setBusy(false); }
  };
  const google = async () => { setBusy(true); setError(null); try { await signInWithGoogle(); if (typeof window !== "undefined") return; router.replace("/(tabs)"); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to continue with Google."); } finally { setBusy(false); } };
  return <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled"><View style={styles.content}><BrandLockup /><View style={styles.header}><Text style={[styles.title, { color: colors.foreground }]}>{mode === "signIn" ? "Welcome back" : "Join SIGLA"}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{mode === "signIn" ? "Sign in to manage your listings and connect with the marketplace." : "Create your account and submit your Telebirr payment for administrator verification."}</Text></View><View style={styles.form}>{mode === "signUp" ? <><Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" colors={colors} /><Field label="Sender phone number" value={phone} onChangeText={setPhone} placeholder="Phone used to send Telebirr" keyboardType="phone-pad" colors={colors} /><View style={[styles.paymentBox, { backgroundColor: colors.secondarySoft }]}><Text style={[styles.paymentTitle, { color: colors.secondaryDark }]}>Registration payment</Text><Text style={[styles.paymentBody, { color: colors.secondaryDark }]}>Send {settings?.registrationFee?.toLocaleString() ?? "…"} ETB to the administrator Telebirr account, then enter the transaction number below.</Text><Text style={[styles.paymentValue, { color: colors.secondaryDark }]}>Mobile: {settings?.telebirrNumber || "Not configured yet"}</Text><Text style={[styles.paymentValue, { color: colors.secondaryDark }]}>Account holder: {settings?.telebirrAccountName || "Not configured yet"}</Text></View><Field label="Telebirr transaction number" value={transactionReference} onChangeText={setTransactionReference} placeholder="e.g. FT123456789" autoCapitalize="characters" colors={colors} /></> : null}<Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} /><Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry colors={colors} />{error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}<ActionButton label={busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account & submit for verification"} disabled={busy} onPress={() => void submit()} />{mode === "signIn" ? <ActionButton label="Continue with Google" variant="outline" disabled={busy} onPress={() => void google()} /> : null}</View><Pressable onPress={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); }} accessibilityRole="button"><Text style={[styles.switchText, { color: colors.primaryDark }]}>{mode === "signIn" ? "New to SIGLA? Create an account" : "Already have an account? Sign in"}</Text></Pressable></View></ScrollView>;
}
function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean; keyboardType?: "email-address" | "phone-pad"; autoCapitalize?: "none" | "characters"; colors: ReturnType<typeof useColors> }) { return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>; }
const styles = StyleSheet.create({ root: { flexGrow: 1 }, content: { width: "100%", maxWidth: 520, alignSelf: "center", padding: Spacing.page, paddingTop: 56, paddingBottom: 48 }, header: { marginTop: 56 }, title: { ...Typography.title, fontSize: 30 }, subtitle: { ...Typography.body, marginTop: Spacing.sm, lineHeight: 23 }, form: { marginTop: Spacing.xxl }, field: { marginBottom: Spacing.lg }, label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm }, input: { minHeight: 52, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Typography.body }, paymentBox: { borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg }, paymentTitle: { ...Typography.heading, fontSize: 16 }, paymentBody: { ...Typography.caption, lineHeight: 18, marginTop: 5 }, paymentValue: { ...Typography.body, fontWeight: "700", marginTop: 8 }, error: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, switchText: { ...Typography.body, textAlign: "center", fontWeight: "700", marginTop: Spacing.xl } });
