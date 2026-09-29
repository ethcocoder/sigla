import { ActivityIndicator, StyleSheet, View } from "react-native";
import AuthScreen from "@/app/auth";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const colors = useColors("light");
  const { session, loading } = useSupabaseAuth();
  if (!isSupabaseConfigured) return <AuthScreen />;
  if (loading) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  return session ? children : <AuthScreen />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center" } });
