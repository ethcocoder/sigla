import { Tabs } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@/components/ionicons";

export default function TabsLayout() {
  const colors = useColors("light");
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: "#5F6368",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D9DDE3",
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: "grid-outline",
            search: "star-outline",
            create: "camera-outline",
            notifications: "chatbox-ellipses-outline",
            profile: "person-outline",
            admin: "shield-checkmark-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Watchlist" }} />
      <Tabs.Screen name="create" options={{ title: "Post" }} />
      <Tabs.Screen name="notifications" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Account" }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="my-posts" options={{ href: null }} />
    </Tabs>
  );
}
