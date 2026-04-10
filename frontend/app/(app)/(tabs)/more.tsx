import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";
import { useAuthStore } from "@/src/store/auth.store";

type IonName = ComponentProps<typeof Ionicons>["name"];

type RowProps = {
  label: string;
  icon: IonName;
  onPress: () => void;
  danger?: boolean;
};

function Row({ label, icon, onPress, danger }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? "#b00020" : welcomeTheme.textDark}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    logout();
    router.replace("/" as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Más</Text>
        <Text style={styles.subtitle}>Accesos secundarios y cuenta</Text>
      </View>
      <View style={styles.list}>
        <Row
          label="Meseros"
          icon="people-outline"
          onPress={() => router.push("/meseros")}
        />
        <Row
          label="Layouts"
          icon="map-outline"
          onPress={() => router.push("/layouts")}
        />
        <Row
          label="Cerrar sesión"
          icon="log-out-outline"
          onPress={onLogout}
          danger
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: welcomeTheme.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },
  list: {
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowPressed: {
    backgroundColor: "#f5f5f5",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: welcomeTheme.textDark,
  },
  rowLabelDanger: {
    color: "#b00020",
  },
});
