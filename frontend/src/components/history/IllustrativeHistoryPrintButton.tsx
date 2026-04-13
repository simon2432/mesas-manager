import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

/**
 * Solo decorativo: no imprime. En web el atributo `title` muestra un tooltip al pasar el mouse.
 */
export function IllustrativeHistoryPrintButton() {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={() => {}}
      accessibilityLabel="Imprimir resumen (ilustrativo, sin acción)"
      accessibilityHint="Este botón no realiza ninguna acción"
      {...(Platform.OS === "web"
        ? ({ title: "Botón ilustrativo" } as Record<string, unknown>)
        : {})}
    >
      <Ionicons name="print-outline" size={20} color={welcomeTheme.textDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: mesasTheme.surface,
  },
  pressed: {
    opacity: 0.85,
  },
});
