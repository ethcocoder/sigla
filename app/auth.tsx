import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BrandLockup } from "@/components/brand-lockup";
import { ActionButton } from "@/components/action-button";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const colors = useColors("light");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signUp") {
        if (name.trim().length < 2) throw new Error("Enter your name to create an account.");
        const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
        if (signUpError) throw signUpError;
        if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
        router.replace("/(tabs)");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to authenticate. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return <View style={[styles.root, { backgroundColor: colors.background }]}><View style={styles.content}><BrandLockup /><View style={styles.header}><Text style={[styles.title, { color: colors.foreground }]}>{mode === "signIn" ? "Welcome back" : "Join SIGLA"}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{mode === "signIn" ? "Sign in to manage your listings and connect with the marketplace." : "Create your account to publish and discover agricultural listings."}</Text></View><View style={styles.form}>{mode === "signUp" ? <Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" colors={colors} /> : null}<Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} /><Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry colors={colors} />{error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}{message ? <Text style={[styles.message, { color: colors.primaryDark }]}>{message}</Text> : null}<ActionButton label={busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"} disabled={busy} onPress={() => void submit()} /></View><Pressable onPress={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); setMessage(null); }} accessibilityRole="button"><Text style={[styles.switchText, { color: colors.primaryDark }]}>{mode === "signIn" ? "New to SIGLA? Create an account" : "Already have an account? Sign in"}</Text></Pressable></View></View>;
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean; keyboardType?: "email-address"; autoCapitalize?: "none"; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { width: "100%", maxWidth: 520, alignSelf: "center", padding: Spacing.page, paddingTop: 56 }, header: { marginTop: 56 }, title: { ...Typography.title, fontSize: 30 }, subtitle: { ...Typography.body, marginTop: Spacing.sm, lineHeight: 23 }, form: { marginTop: Spacing.xxl }, field: { marginBottom: Spacing.lg }, label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm }, input: { minHeight: 52, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Typography.body }, error: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, message: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, switchText: { ...Typography.body, textAlign: "center", fontWeight: "700", marginTop: Spacing.xl }, });
