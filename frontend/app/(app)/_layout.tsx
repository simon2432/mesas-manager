import { Redirect, Stack } from "expo-router";

import { useSessionBootstrap } from "@/src/hooks/useSessionBootstrap";
import { welcomeTheme } from "@/src/constants/authTheme";
import { useAuthStore } from "@/src/store/auth.store";

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  useSessionBootstrap(!!token);

  if (!token) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: welcomeTheme.white },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="meseros"
        options={{
          headerShown: true,
          title: "Meseros",
          headerTintColor: welcomeTheme.orange,
          headerStyle: { backgroundColor: welcomeTheme.white },
        }}
      />
      <Stack.Screen
        name="layouts"
        options={{
          headerShown: true,
          title: "Layouts",
          headerTintColor: welcomeTheme.orange,
          headerStyle: { backgroundColor: welcomeTheme.white },
        }}
      />
      <Stack.Screen
        name="gestion-mesas"
        options={{
          headerShown: true,
          title: "Gestión mesas",
          headerTintColor: welcomeTheme.orange,
          headerStyle: { backgroundColor: welcomeTheme.white },
        }}
      />
      <Stack.Screen
        name="informacion-uso"
        options={{
          headerShown: true,
          title: "Información de uso",
          headerTintColor: welcomeTheme.orange,
          headerStyle: { backgroundColor: welcomeTheme.white },
        }}
      />
      <Stack.Screen
        name="mesa/[id]"
        options={{
          headerShown: true,
          title: "Mesa",
          headerTintColor: welcomeTheme.orange,
          headerStyle: { backgroundColor: welcomeTheme.white },
        }}
      />
    </Stack>
  );
}
