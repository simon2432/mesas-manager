import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";

export default function DashboardTabScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.box}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.sub}>
          Acá irá el resumen operativo (KPIs, gráficos, alertas).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: welcomeTheme.white,
  },
  box: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
});
