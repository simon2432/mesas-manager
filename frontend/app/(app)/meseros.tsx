import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";

export default function MeserosScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.box}>
        <Text style={styles.title}>Meseros</Text>
        <Text style={styles.sub}>
          Gestión de turnos, asignación a mesas y rendimiento.
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
