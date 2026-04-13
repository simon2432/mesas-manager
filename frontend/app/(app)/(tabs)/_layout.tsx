import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: welcomeTheme.orange,
        tabBarInactiveTintColor: mesasTheme.muted,
        tabBarStyle: {
          backgroundColor: welcomeTheme.white,
          borderTopColor: mesasTheme.border,
        },
      }}
    >
      <Tabs.Screen
        name="mesas"
        options={{
          title: "Mesas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menú",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Más",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
