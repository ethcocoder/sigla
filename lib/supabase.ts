import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";

const fallbackUrl = "https://sigla-unconfigured.supabase.co";
const runtime = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabasePublishableKey?: string };
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? runtime.supabaseUrl ?? fallbackUrl;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? runtime.supabasePublishableKey ?? "sigla-unconfigured-public-key";

export const isSupabaseConfigured = Boolean((process.env.EXPO_PUBLIC_SUPABASE_URL ?? runtime.supabaseUrl) && (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? runtime.supabasePublishableKey));

const webStorage = {
  getItem: async (key: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured for this environment");
  }
}
