import { Ionicons } from "@/components/ionicons";
import { Tabs } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function TabsLayout() {
  const colors = useColors("light");
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: "home-outline",
            search: "search-outline",
            notifications: "notifications-outline",
            profile: "person-outline",
            admin: "shield-checkmark-outline",
          };
          return <Ionicons name={icons[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}
