import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { statusLabel } from "@/lib/backend/profile";
import { firebaseAuth, signOut } from "@/lib/firebase";

export default function ProfileScreen() {
  const { session, profile, isAdmin } = useFirebaseAuth();
  const name =
    profile?.name || session?.user.user_metadata.name || "SIGLA member";
  const status = profile?.status ? statusLabel(profile.status) : "Registered";
  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>ACCOUNT</Text>
        <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>
              {profile?.phone || session?.user.email || "Google account"}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={23} color="#77A832" />
        </View>
        <View style={styles.status}>
          <Text style={styles.statusLabel}>{status.toUpperCase()}</Text>
          <Text style={styles.statusText}>
            {profile?.status === "ACTIVE"
              ? "Your SIGLA account is active."
              : "Your account is waiting for payment verification."}
          </Text>
        </View>
        {isAdmin ? (
          <Pressable
            onPress={() => router.push("/(tabs)/admin")}
            style={styles.admin}
          >
            <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
            <Text style={styles.adminText}>Open admin control center</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <Menu
          label="My posts"
          icon="document-text-outline"
          onPress={() => router.push("/(tabs)/my-posts" as never)}
        />
        <Menu
          label="Payment history"
          icon="receipt-outline"
          onPress={() => router.push("/(tabs)/notifications")}
        />
        <Menu
          label="Help & support"
          icon="help-circle-outline"
          onPress={() => router.push("/support" as never)}
        />
        <Pressable
          onPress={() => void signOut(firebaseAuth)}
          style={styles.signOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#D54242" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
function Menu({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menu}>
      <Ionicons name={icon} size={21} color="#5F6870" />
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9AA3AB" />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topbar: {
    height: 74,
    backgroundColor: "#2F8BEA",
    paddingTop: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topbarTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  content: { padding: 18 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E7",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D9F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#2F76BD", fontSize: 24, fontWeight: "900" },
  profileCopy: { flex: 1 },
  name: { color: "#23272B", fontSize: 18, fontWeight: "900" },
  phone: { color: "#68727C", fontSize: 13, marginTop: 4 },
  status: { backgroundColor: "#FFF9DF", padding: 16, marginVertical: 17 },
  statusLabel: {
    color: "#7C6820",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  statusText: { color: "#7C6820", fontSize: 13, marginTop: 5 },
  admin: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: "#2F76BD",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 15,
  },
  adminText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", flex: 1 },
  menu: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E7",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  menuText: { color: "#2C3135", fontSize: 15, flex: 1 },
  signOut: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
  },
  signOutText: { color: "#D54242", fontWeight: "800" },
});
