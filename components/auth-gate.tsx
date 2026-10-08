import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import AuthScreen from "@/app/auth";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { signOut, firestore } from "@/lib/firebase";
import { getPlatformSettings } from "@/lib/backend/settings";
import { submitRegistrationPayment } from "@/lib/backend/payments";
import { useTranslation } from "@/lib/i18n-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const colors = useColors("light");
  const { session, profile, loading, profileLoading } = useFirebaseAuth();
  const { language, t } = useTranslation();
  const [telebirrNumber, setTelebirrNumber] = useState("");
  const [telebirrAccountName, setTelebirrAccountName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [registrationFee, setRegistrationFee] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || profile?.status === "ACTIVE") return;
    // This effect intentionally mirrors the live profile into editable form fields.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(
      profile?.name && profile.name !== "SIGLA member"
        ? profile.name
        : (session.user.user_metadata.name ?? ""),
    );
    setPhone(profile?.phone ?? session.user.user_metadata.phone ?? "");
    void getPlatformSettings()
      .then((settings) => {
        setRegistrationFee(settings.registrationFee ?? 0);
        setTelebirrNumber(settings.telebirrNumber ?? "");
        setTelebirrAccountName(settings.telebirrAccountName ?? "");
      })
      .catch(() => undefined);
  }, [profile?.name, profile?.phone, profile?.status, session]);

  const submitVerification = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (name.trim().length < 2) throw new Error("Enter your full name.");
      if (phone.trim().length < 7)
        throw new Error("Enter a valid sender phone number.");
      if (!transactionReference.trim())
        throw new Error("Enter the Telebirr transaction number.");
      if (!telebirrAccountName.trim())
        throw new Error(
          "The administrator payment account is not configured yet.",
        );

      await setDoc(
        doc(firestore, "users", session?.user.id ?? ""),
        {
          name: name.trim(),
          phone: phone.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await submitRegistrationPayment({
        amount: registrationFee,
        senderPhone: phone,
        transactionReference,
        accountHolderName: telebirrAccountName,
      });
      setSubmitted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit your verification details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (session && profileLoading)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!session) return <AuthScreen />;
  if (profile?.status === "ACTIVE") return children;

  const waitingForReview =
    submitted ||
    profile?.status === "PAYMENT_PENDING" ||
    profile?.status === "UNDER_REVIEW";

  return (
    <View style={[styles.pendingRoot, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.secondaryDark }]}>
          {language === "am" ? "የመለያ ማረጋገጫ" : language === "om" ? "MIRKANEESSA HERREGAA" : "ACCOUNT VERIFICATION"}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {language === "am" ? "የSIGLA መለያዎን ያጠናቅቁ" : language === "om" ? "Herrega SIGLA kee guuti" : "Complete your SIGLA account"}
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          {language === "am" ? "በGoogle መግባት ተጠናቋል። የግብርና እቃዎችን ከማየትና ከመለጠፍዎ በፊት የምዝገባ ክፍያን ይላኩ።" : language === "om" ? "Google waliin seenuun xumurameera. Meeshaalee qonnaa ilaaluuf kaffaltii galmee ergi." : "Sign in with Google is complete. Before you can browse and post agricultural supplies, send the registration payment and share the transaction details below."}
        </Text>

        <View
          style={[styles.detail, { backgroundColor: colors.secondarySoft }]}
        >
          <Text style={[styles.detailLabel, { color: colors.secondaryDark }]}>
            {language === "am" ? "የምዝገባ ክፍያን ወደ" : language === "om" ? "KAFFALTII GALMEE ERGI" : "SEND REGISTRATION PAYMENT TO"}
          </Text>
          <Text style={[styles.detailValue, { color: colors.secondaryDark }]}>
            {telebirrNumber || (language === "am" ? "አስተዳዳሪው ቁጥር አላዘጋጀም" : language === "om" ? "Bulchaan lakkoofsa hin qopheessine" : "Admin has not configured a number yet")}
          </Text>
          <Text style={[styles.detailValue, { color: colors.secondaryDark }]}>
            {telebirrAccountName || (language === "am" ? "የመለያ ባለቤት ስም እዚህ ይታያል" : language === "om" ? "Maqaan abbaa herregaa asitti mul'ata" : "Account holder name will appear here")}
          </Text>
          <Text style={[styles.detailBody, { color: colors.secondaryDark }]}>
              {language === "am" ? "መጠን" : language === "om" ? "Hanga" : "Amount"}: {registrationFee.toLocaleString()} ETB
          </Text>
        </View>

        {waitingForReview ? (
          <View
            style={[styles.successBox, { backgroundColor: colors.primarySoft }]}
          >
            <Text style={[styles.successTitle, { color: colors.primaryDark }]}>
              {language === "am" ? "ዝርዝሩ ለግምገማ ተልኳል" : language === "om" ? "Bal'inni qorannoof ergameera" : "Details submitted for review"}
            </Text>
            <Text style={[styles.successBody, { color: colors.primaryDark }]}>
              {language === "am" ? "አስተዳዳሪው የTelebirr ግብይትዎን ያረጋግጣል። ከፀደቀ በኋላ ገበያውን መጠቀም ይችላሉ።" : language === "om" ? "Bulchaan kaffaltii Telebirr kee mirkaneessa. Erga mirkanaa'ee booda gabaa fayyadamuu dandeessa." : "An administrator will verify your Telebirr transaction. Your marketplace access will open after approval."}
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Field
              label={language === "am" ? "ሙሉ ስም" : language === "om" ? "Maqaa guutuu" : "Full name"}
              value={name}
              onChangeText={setName}
              placeholder={language === "am" ? "ሙሉ ስምዎ" : language === "om" ? "Maqaa kee guutuu" : "Your full name"}
              colors={colors}
            />
            <Field
              label={language === "am" ? "የላኪ ስልክ ቁጥር" : language === "om" ? "Lakkoofsa bilbila ergituu" : "Sender phone number"}
              value={phone}
              onChangeText={setPhone}
              placeholder={language === "am" ? "Telebirr ለመላክ የተጠቀሙበት ስልክ" : language === "om" ? "Bilbila Telebirr itti ergite" : "Phone used to send Telebirr"}
              keyboardType="phone-pad"
              colors={colors}
            />
            <Field
              label={language === "am" ? "የTelebirr ግብይት ቁጥር" : language === "om" ? "Lakkoofsa kaffaltii Telebirr" : "Telebirr transaction number"}
              value={transactionReference}
              onChangeText={setTransactionReference}
              placeholder="FT123456789"
              autoCapitalize="characters"
              colors={colors}
            />
            {error ? (
              <Text style={[styles.error, { color: colors.error }]}>
                {error}
              </Text>
            ) : null}
            <Pressable
              disabled={submitting}
              onPress={() => void submitVerification()}
              style={({ pressed }) => [
                styles.submit,
                { backgroundColor: colors.primaryDark },
                pressed && styles.pressed,
                submitting && styles.disabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>
                  {language === "am" ? "ለአስተዳዳሪ ግምገማ ላክ" : language === "om" ? "Qorannoo bulchaaf ergi" : "Submit for administrator review"}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {!waitingForReview && !error ? (
          <Text style={[styles.status, { color: colors.muted }]}>
          {language === "am" ? "የአሁኑ ሁኔታ" : language === "om" ? "Haala ammaa" : "Current status"}:{" "}
            {(profile?.status ?? "REGISTERED").replaceAll("_", " ")}
          </Text>
        ) : null}
        <Pressable
          onPress={() => void signOut()}
          style={styles.signOut}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {t("common.signOut")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  colors: ReturnType<typeof useColors>;
  keyboardType?: "phone-pad";
  autoCapitalize?: "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  pendingRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderWidth: 1,
    borderRadius: 20,
    padding: 28,
  },
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 10 },
  body: { fontSize: 16, lineHeight: 24, marginTop: 14 },
  detail: { borderRadius: 14, padding: 18, marginTop: 22 },
  detailLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  detailValue: { fontSize: 17, fontWeight: "700", marginTop: 6 },
  detailBody: { fontSize: 14, fontWeight: "700", marginTop: 10 },
  form: { marginTop: 22, gap: 16 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "800" },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: { fontSize: 13, lineHeight: 18, fontWeight: "700", marginTop: -4 },
  submit: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  successBox: { borderRadius: 14, padding: 18, marginTop: 22 },
  successTitle: { fontSize: 16, fontWeight: "800" },
  successBody: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  status: { fontSize: 14, fontWeight: "700", marginTop: 18 },
  signOut: {
    alignItems: "center",
    marginTop: 24,
    minHeight: 44,
    justifyContent: "center",
  },
  signOutText: { fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
