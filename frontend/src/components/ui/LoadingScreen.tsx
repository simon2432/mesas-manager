import { ActivityIndicator, StyleSheet, View } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";

export function LoadingScreen() {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={welcomeTheme.textDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: welcomeTheme.orange,
  },
});
