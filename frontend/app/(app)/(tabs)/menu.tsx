import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.box}>
        <Text style={styles.title}>Menú / carta</Text>
        <Text style={styles.sub}>
          Listado de platos, precios y categorías para el salón.
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
