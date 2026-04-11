import { type Href, Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AuthSuccessResponse } from "@/src/api/auth.api";
import { LoginModal } from "@/src/components/auth/LoginModal";
import { RegisterModal } from "@/src/components/auth/RegisterModal";
import { welcomeTheme } from "@/src/constants/authTheme";
import { useAuthStore } from "@/src/store/auth.store";
import { useOperationalDayStore } from "@/src/store/operationalDay.store";

// require() no resuelve alias @/
const LOGO_SOURCE = require("../assets/images/mesas-logo.png");

export default function WelcomeScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const onAuthSuccess = (data: AuthSuccessResponse) => {
    useOperationalDayStore.getState().setServerTodayYmd(data.serverTodayYmd);
    setSession({ token: data.token, user: data.user });
    setLoginOpen(false);
    setRegisterOpen(false);
    router.replace("/mesas" as Href);
  };

  if (token) {
    return <Redirect href={"/mesas" as Href} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.logoBlock}>
          <View style={styles.logoPanel}>
            <Image
              source={LOGO_SOURCE}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Mesas Manager"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={() => setLoginOpen(true)}
          >
            <Text style={styles.btnText}>iniciar sesion</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={() => setRegisterOpen(true)}
          >
            <Text style={styles.btnText}>registrarme</Text>
          </Pressable>
        </View>
      </View>

      <LoginModal
        visible={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={onAuthSuccess}
      />
      <RegisterModal
        visible={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={onAuthSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: welcomeTheme.orange,
  },
  root: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: "14%",
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoPanel: {
    backgroundColor: welcomeTheme.white,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 260,
    height: 160,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
    alignSelf: "center",
  },
  btn: {
    backgroundColor: welcomeTheme.white,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnText: {
    color: welcomeTheme.textDark,
    fontSize: 16,
    fontWeight: "500",
    textTransform: "lowercase",
    letterSpacing: 0.2,
  },
});
