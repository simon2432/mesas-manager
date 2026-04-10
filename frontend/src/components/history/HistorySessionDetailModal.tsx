import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchDailyClosedSessionDetail } from "@/src/api/history.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type Props = {
  visible: boolean;
  sessionId: number | null;
  dateYmd: string;
  onClose: () => void;
};

export function HistorySessionDetailModal({
  visible,
  sessionId,
  dateYmd,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ["history", "daily", dateYmd, sessionId],
    queryFn: () => fetchDailyClosedSessionDetail(sessionId!, dateYmd),
    enabled: visible && sessionId != null,
  });

  const s = query.data;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={mesasModalStyles.backdrop}>
        <Pressable style={mesasModalStyles.dim} onPress={onClose} />
        <View
          style={[
            mesasModalStyles.sheet,
            styles.sheet,
            Platform.OS === "web" && styles.sheetWeb,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Detalle de sesión</Text>

          {query.isPending ? (
            <ActivityIndicator
              color={welcomeTheme.orange}
              style={{ marginVertical: 24 }}
            />
          ) : query.isError ? (
            <Text style={mesasModalStyles.errorText}>
              No se pudo cargar el detalle.
            </Text>
          ) : s ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.metaBlock}>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaKey}>Mesa </Text>
                  <Text style={styles.metaVal}>N.º {s.tableNumber}</Text>
                </Text>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaKey}>Mesero </Text>
                  <Text style={styles.metaVal}>{s.waiterName}</Text>
                </Text>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaKey}>Personas </Text>
                  <Text style={styles.metaVal}>{s.guestCount}</Text>
                </Text>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaKey}>Apertura </Text>
                  <Text style={styles.metaVal}>{formatDt(s.openedAt)}</Text>
                </Text>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaKey}>Cierre </Text>
                  <Text style={styles.metaVal}>{formatDt(s.closedAt)}</Text>
                </Text>
                <Text style={styles.totalLine}>
                  Total {formatMoney(s.total)}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Consumos ({s.items.length})
              </Text>
              {s.items.length === 0 ? (
                <Text style={styles.empty}>Sin ítems registrados.</Text>
              ) : (
                s.items.map((line) => (
                  <View key={line.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{line.productName}</Text>
                      <Text style={styles.itemMeta}>
                        {line.quantity} × {formatMoney(line.unitPrice)}
                        {line.note ? ` · ${line.note}` : ""}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      {formatMoney(line.lineTotal)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}

          <Pressable style={mesasModalStyles.ghostBtn} onPress={onClose}>
            <Text style={mesasModalStyles.ghostBtnText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "88%",
  },
  sheetWeb: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  metaBlock: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  metaLine: {
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  metaKey: {
    color: mesasTheme.muted,
    fontWeight: "600",
  },
  metaVal: {
    color: welcomeTheme.textDark,
    fontWeight: "700",
  },
  totalLine: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: mesasTheme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  empty: {
    fontSize: 14,
    color: mesasTheme.muted,
    fontStyle: "italic",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
    gap: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  itemMeta: {
    fontSize: 13,
    color: mesasTheme.muted,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
});
