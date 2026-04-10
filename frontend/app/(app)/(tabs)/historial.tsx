import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";

export default function HistorialScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.box}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.sub}>
          Sesiones y movimientos cerrados aparecerán en esta sección.
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
