import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ConfirmProvider } from "@/src/components/ui/ConfirmProvider";
import { authColors } from "@/src/constants/authTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ConfirmProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: authColors.surface },
              headerTintColor: authColors.text,
              headerTitleStyle: { fontWeight: "700" },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: authColors.bg },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(app)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ConfirmProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
