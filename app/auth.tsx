import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ActionButton } from "@/components/action-button";
import { BrandLockup } from "@/components/brand-lockup";
import { useColors } from "@/hooks/use-colors";
import { submitRegistrationPayment } from "@/lib/backend/payments";
import { getPlatformSettings } from "@/lib/backend/settings";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { MarketplaceSettings } from "@/types/domain";

export default function AuthScreen() {
  const colors = useColors("light");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getPlatformSettings()
      .then((nextSettings) => {
        if (mounted) setSettings(nextSettings);
      })
      .catch((cause) => {
        if (mounted) setError(cause instanceof Error ? cause.message : "Unable to load registration settings.");
      })
      .finally(() => {
        if (mounted) setSettingsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const registrationFee = settings?.registrationFee ?? 0;
  const requiresPayment = registrationFee > 0;

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (!isSupabaseConfigured) throw new Error("Supabase is not configured for this environment.");
      if (!email.trim()) throw new Error("Enter your email address.");
      if (password.length < 8) throw new Error("Use a password with at least 8 characters.");

      if (mode === "signUp") {
        if (name.trim().length < 2) throw new Error("Enter your name to create an account.");
        if (phone.trim().length < 7) throw new Error("Enter a valid phone number.");
        if (requiresPayment && !settings?.telebirrNumber.trim()) throw new Error("Registration payments are not configured yet. Please contact support.");
        if (requiresPayment && senderPhone.trim().length < 7) throw new Error("Enter the phone number used to send the Telebirr payment.");
        if (requiresPayment && transactionReference.trim().length < 3) throw new Error("Enter the Telebirr transaction number so your payment can be confirmed.");

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim(), phone: phone.trim() } },
        });
        if (signUpError) throw signUpError;

        if (!data.session || !data.user) {
          setMessage("Account created. Confirm your email, then sign in to submit or finish your registration payment.");
          return;
        }

        if (requiresPayment) {
          await submitRegistrationPayment({
            amount: registrationFee,
            senderPhone: senderPhone.trim(),
            transactionReference: transactionReference.trim(),
          });
          setMessage("Account created. Your Telebirr payment was submitted for confirmation.");
        } else {
          setMessage("Account created. Registration is currently free, so no Telebirr payment is required.");
        }
        setMode("signIn");
        setPassword("");
        setSenderPhone("");
        setTransactionReference("");
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

  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <BrandLockup />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>{mode === "signIn" ? "Welcome back" : "Join SIGLA"}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {mode === "signIn" ? "Sign in to manage your listings and connect with the marketplace." : "Create your account to publish and discover agricultural listings."}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === "signUp" ? <>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" colors={colors} />
            <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="Your phone number" keyboardType="phone-pad" colors={colors} />
            <RegistrationPaymentPanel settings={settings} loading={settingsLoading} senderPhone={senderPhone} transactionReference={transactionReference} onSenderPhoneChange={setSenderPhone} onTransactionReferenceChange={setTransactionReference} colors={colors} />
          </> : null}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry colors={colors} />
          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          {message ? <Text style={[styles.message, { color: colors.primaryDark }]}>{message}</Text> : null}
          <ActionButton label={busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"} disabled={busy || (mode === "signUp" && settingsLoading)} onPress={() => void submit()} />
        </View>

        <Pressable onPress={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); setMessage(null); }} accessibilityRole="button">
          <Text style={[styles.switchText, { color: colors.primaryDark }]}>{mode === "signIn" ? "New to SIGLA? Create an account" : "Already have an account? Sign in"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RegistrationPaymentPanel({ settings, loading, senderPhone, transactionReference, onSenderPhoneChange, onTransactionReferenceChange, colors }: { settings: MarketplaceSettings | null; loading: boolean; senderPhone: string; transactionReference: string; onSenderPhoneChange: (value: string) => void; onTransactionReferenceChange: (value: string) => void; colors: ReturnType<typeof useColors> }) {
  if (loading) return <Text style={[styles.hint, { color: colors.muted }]}>Loading registration payment details…</Text>;
  const fee = settings?.registrationFee ?? 0;
  if (fee <= 0) return <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.paymentTitle, { color: colors.foreground }]}>Registration is currently free</Text><Text style={[styles.hint, { color: colors.muted }]}>No Telebirr payment is required to create your SIGLA account.</Text></View>;
  return <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.paymentTitle, { color: colors.foreground }]}>Confirm your registration payment</Text><Text style={[styles.hint, { color: colors.muted }]}>Send {fee.toLocaleString()} ETB to the Telebirr number below, then enter the sender phone and transaction number. An admin will confirm the payment before activation.</Text><Text style={[styles.telebirrLabel, { color: colors.muted }]}>Telebirr number</Text><Text selectable style={[styles.telebirrNumber, { color: colors.primaryDark }]}>{settings?.telebirrNumber || "Not configured"}</Text><Field label="Sender phone number" value={senderPhone} onChangeText={onSenderPhoneChange} placeholder="Phone used for Telebirr" keyboardType="phone-pad" colors={colors} /><Field label="Telebirr transaction number" value={transactionReference} onChangeText={onTransactionReferenceChange} placeholder="e.g. TXN123456" autoCapitalize="characters" colors={colors} /></View>;
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean; keyboardType?: "email-address" | "phone-pad"; autoCapitalize?: "none" | "characters"; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>;
}

const styles = StyleSheet.create({ root: { flexGrow: 1 }, content: { width: "100%", maxWidth: 520, alignSelf: "center", padding: Spacing.page, paddingTop: 56, paddingBottom: 48 }, header: { marginTop: 56 }, title: { ...Typography.title, fontSize: 30 }, subtitle: { ...Typography.body, marginTop: Spacing.sm, lineHeight: 23 }, form: { marginTop: Spacing.xxl }, field: { marginBottom: Spacing.lg }, label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm }, input: { minHeight: 52, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Typography.body }, paymentCard: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg }, paymentTitle: { ...Typography.body, fontWeight: "800", marginBottom: Spacing.sm }, hint: { ...Typography.caption, lineHeight: 18 }, telebirrLabel: { ...Typography.caption, fontWeight: "700", marginTop: Spacing.md }, telebirrNumber: { ...Typography.title, fontSize: 22, fontWeight: "800", marginTop: 4, marginBottom: Spacing.md }, error: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, message: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, switchText: { ...Typography.body, textAlign: "center", fontWeight: "700", marginTop: Spacing.xl }, });
