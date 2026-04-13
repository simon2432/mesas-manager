import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import { closeTableSession } from "@/src/api/tableSessions.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import { modalStackingProps } from "@/src/constants/modalPresentation";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";
import { formatMoney } from "@/src/utils/formatMoney";

type Props = {
  visible: boolean;
  sessionId: number;
  tableNumber: number;
  guestCount: number;
  itemCount: number;
  total: number;
  onClose: () => void;
  onClosed: () => void;
};

export function CloseSessionModal({
  visible,
  sessionId,
  tableNumber,
  guestCount,
  itemCount,
  total,
  onClose,
  onClosed,
}: Props) {
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await closeTableSession(sessionId);
      Alert.alert(
        "Mesa cerrada",
        "La sesión finalizó y la mesa volvió a estado libre.",
      );
      onClosed();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo cerrar la mesa."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      {...modalStackingProps}
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={mesasModalStyles.backdrop}>
        <Pressable style={mesasModalStyles.dim} onPress={onClose} />
        <View
          style={[
            mesasModalStyles.sheet,
            Platform.OS === "web" && styles.sheetWeb,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Cerrar mesa</Text>
          <Text style={mesasModalStyles.sheetHint}>
            Se va a cerrar la sesión de la mesa {tableNumber}. El salón volverá
            a marcarla como libre.
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Comensales</Text>
              <Text style={styles.summaryValue}>{guestCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Líneas de consumo</Text>
              <Text style={styles.summaryValue}>{itemCount}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total a cobrar</Text>
              <Text style={styles.totalValue}>{formatMoney(total)}</Text>
            </View>
          </View>

          {error ? (
            <Text style={mesasModalStyles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            style={[
              styles.dangerBtn,
              submitting && mesasModalStyles.primaryBtnDisabled,
            ]}
            onPress={confirm}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.dangerBtnText}>Confirmar cierre</Text>
            )}
          </Pressable>

          <Pressable style={mesasModalStyles.ghostBtn} onPress={onClose}>
            <Text style={mesasModalStyles.ghostBtnText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetWeb: {
    maxWidth: 420,
    alignSelf: "center",
    width: "100%",
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: mesasTheme.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: mesasTheme.surface,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: mesasTheme.muted,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
  dangerBtn: {
    backgroundColor: "#b00020",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 4,
  },
  dangerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
