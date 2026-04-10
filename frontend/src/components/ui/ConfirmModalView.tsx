import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

export type ConfirmModalViewProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Diálogo de confirmación centrado, alineado al resto de modales del salón.
 */
export function ConfirmModalView({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmModalViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View
        style={[
          styles.wrap,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Pressable
          style={styles.dim}
          onPress={onCancel}
          accessibilityLabel="Cerrar diálogo"
        />
        <View
          style={[styles.card, Platform.OS === "web" ? styles.cardWeb : null]}
          accessibilityRole="alert"
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.btnGhost,
                pressed && styles.btnPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.btnGhostText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                destructive ? styles.btnDanger : styles.btnPrimary,
                pressed && styles.btnPressed,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(15, 18, 24, 0.55)",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    zIndex: 2,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  cardWeb: {
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: mesasTheme.muted,
    marginBottom: 22,
  },
  actions: {
    flexDirection: "column",
    gap: 10,
  },
  btnGhost: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: mesasTheme.surface,
    borderWidth: 1,
    borderColor: mesasTheme.border,
  },
  btnGhostText: {
    fontSize: 15,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  btnPrimary: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: welcomeTheme.orange,
  },
  btnDanger: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#b00020",
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  btnPressed: {
    opacity: 0.88,
  },
});
