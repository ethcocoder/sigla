import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/i18n-provider";

export default function TabLayout() {
  const colors = useColors("light");
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;
  const icon = (name: keyof typeof Ionicons.glyphMap) => function SiglaTabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  };

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 0.5 } }}>
      <Tabs.Screen name="index" options={{ title: t("nav.home"), tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="search" options={{ title: t("nav.search"), tabBarIcon: icon("search-outline") }} />
      <Tabs.Screen name="create" options={{ title: t("nav.create"), tabBarIcon: icon("add-circle") }} />
      <Tabs.Screen name="notifications" options={{ title: t("nav.notifications"), tabBarIcon: icon("notifications-outline") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile"), tabBarIcon: icon("person-outline") }} />
    </Tabs>
  );
}
