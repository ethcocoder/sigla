import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase";

const palette = {
  lime: "#A8E600",
  yellow: "#FFF06B",
  orange: "#FFB45A",
  blue: "#4F8B2A",
  blueDark: "#315D1D",
  ink: "#111111",
  muted: "#596146",
  white: "#FFFFFF",
  error: "#B42318",
  field: "#F7FBEA",
};

export default function AuthScreen() {
  const [adminMode, setAdminMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const continueWithGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (typeof window !== "undefined") router.replace("/(tabs)");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to continue with Google.",
      );
    } finally {
      setBusy(false);
    }
  };

  const continueAsAdmin = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!email.trim())
        throw new Error("Enter the administrator email address.");
      if (!password) throw new Error("Enter the administrator password.");
      await signInWithEmail(email, password);
      router.replace("/(tabs)/admin");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign in as administrator.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.root}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View
            style={styles.brandRow}
            accessibilityRole="header"
            accessibilityLabel="SIGLA ሲግላ"
          >
            <View style={styles.brandMark}>
              <View style={[styles.leaf, styles.leafLeft]} />
              <View style={[styles.leaf, styles.leafRight]} />
              <View style={styles.stem} />
            </View>
            <View>
              <Text style={styles.wordmark}>SIGLA</Text>
              <Text style={styles.amharic}>ሲግላ</Text>
            </View>
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.amharicHeadline}>የግብርና እቃዎች</Text>
            <Text style={styles.headline}>በአንድ ቦታ</Text>
            <Text style={styles.supporting}>
              Find trusted herbicides, pesticides, fertilizers, and other
              crop-care supplies from nearby sellers.
            </Text>
          </View>

          <View style={styles.categoryRow}>
            <Category
              icon="leaf-outline"
              label="Fertilizer"
              color={palette.yellow}
            />
            <Category
              icon="bug-outline"
              label="Pesticide"
              color={palette.orange}
            />
            <Category
              icon="flask-outline"
              label="Herbicide"
              color={palette.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Text style={styles.cardEyebrow}>
            {adminMode ? "SIGLA ADMINISTRATION" : "AGRICULTURAL SUPPLY MARKET"}
          </Text>
          <Text style={styles.cardTitle}>
            {adminMode ? "Administrator sign in" : "Start with Google"}
          </Text>
          <Text style={styles.cardBody}>
            {adminMode
              ? "Use the administrator account to review listings, manage users, and maintain marketplace settings."
              : "Use your Google account to discover and share agricultural supplies. No registration email or password needed."}
          </Text>

          {adminMode ? (
            <View style={styles.adminForm}>
              <Field
                label="Administrator email"
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              adminMode ? "Sign in as administrator" : "Continue with Google"
            }
            disabled={busy}
            onPress={() =>
              void (adminMode ? continueAsAdmin() : continueWithGoogle())
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={palette.white} />
            ) : adminMode ? (
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={palette.white}
              />
            ) : (
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
            )}
            <Text style={styles.primaryLabel}>
              {busy
                ? "Connecting…"
                : adminMode
                  ? "Sign in to admin"
                  : "Continue with Google"}
            </Text>
            {!busy ? (
              <Ionicons name="arrow-forward" size={20} color={palette.white} />
            ) : null}
          </Pressable>

          <Text style={styles.privacyNote}>
            {adminMode
              ? "Admin access is restricted to approved SIGLA administrators."
              : "By continuing, you agree to use SIGLA responsibly and keep marketplace interactions respectful."}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            adminMode
              ? "Return to Google sign in"
              : "Open administrator sign in"
          }
          onPress={() => {
            setAdminMode((current) => !current);
            setError(null);
          }}
          style={({ pressed }) => [
            styles.adminLink,
            pressed && styles.linkPressed,
          ]}
        >
          <Ionicons
            name={adminMode ? "arrow-back-outline" : "shield-outline"}
            size={15}
            color={palette.ink}
          />
          <Text style={styles.adminLinkText}>
            {adminMode ? "Back to marketplace sign in" : "Admin sign in"}
          </Text>
        </Pressable>

        <Text style={styles.footer}>Grow smarter. Trade safely. SIGLA.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Category({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.categoryPill, { backgroundColor: color }]}>
      <Ionicons name={icon} size={16} color={palette.ink} />
      <Text style={styles.categoryText}>{label}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "email-address";
  autoCapitalize?: "none";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.lime },
  root: { flexGrow: 1, paddingBottom: 28 },
  hero: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 30 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  leaf: {
    position: "absolute",
    width: 13,
    height: 25,
    borderRadius: 14,
    backgroundColor: palette.lime,
  },
  leafLeft: { left: 9, top: 7, transform: [{ rotate: "35deg" }] },
  leafRight: { right: 9, top: 5, transform: [{ rotate: "-35deg" }] },
  stem: {
    position: "absolute",
    width: 3,
    height: 24,
    bottom: 3,
    borderRadius: 3,
    backgroundColor: palette.white,
    transform: [{ rotate: "8deg" }],
  },
  wordmark: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  amharic: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    marginTop: -2,
  },
  headlineBlock: { marginTop: 56 },
  amharicHeadline: {
    color: palette.ink,
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  headline: {
    color: palette.ink,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  supporting: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    maxWidth: 360,
    marginTop: 18,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 24,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryText: { color: palette.ink, fontSize: 12, fontWeight: "800" },
  card: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    minHeight: 300,
  },
  cardAccent: {
    width: 44,
    height: 5,
    backgroundColor: palette.blue,
    borderRadius: 999,
    marginBottom: 22,
  },
  cardEyebrow: {
    color: palette.blueDark,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    marginTop: 8,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 380,
  },
  adminForm: { marginTop: 20, gap: 14 },
  field: { gap: 6 },
  fieldLabel: { color: palette.ink, fontSize: 12, fontWeight: "800" },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D9E6B6",
    borderRadius: 14,
    backgroundColor: palette.field,
    paddingHorizontal: 14,
    color: palette.ink,
    fontSize: 15,
  },
  error: {
    color: palette.error,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: palette.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingHorizontal: 18,
    marginTop: 24,
    shadowColor: palette.blueDark,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  googleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: { color: palette.blueDark, fontSize: 17, fontWeight: "900" },
  primaryLabel: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "900",
    flex: 1,
  },
  privacyNote: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 18,
  },
  adminLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  adminLinkText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  footer: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  linkPressed: { opacity: 0.62 },
  disabled: { opacity: 0.72 },
});
