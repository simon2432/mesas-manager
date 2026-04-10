import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { fetchTableCurrent } from "@/src/api/tables.api";
import type { SessionItemPublic } from "@/src/api/tableSessions.api";
import { AddConsumptionModal } from "@/src/components/mesaSession/AddConsumptionModal";
import { CloseSessionModal } from "@/src/components/mesaSession/CloseSessionModal";
import { EditItemModal } from "@/src/components/mesaSession/EditItemModal";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function MesaDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const tableId = Number(idParam);
  const validId = Number.isInteger(tableId) && tableId > 0;

  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [editItem, setEditItem] = useState<SessionItemPublic | null>(null);

  const query = useQuery({
    queryKey: ["tables", tableId, "current"],
    queryFn: () => fetchTableCurrent(tableId),
    enabled: validId,
  });

  const refreshDetail = () => {
    qc.invalidateQueries({ queryKey: ["tables", tableId, "current"] });
    qc.invalidateQueries({ queryKey: ["tables"] });
    qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
  };

  const tableForTitle = query.data?.table;
  useLayoutEffect(() => {
    const title = tableForTitle ? `Mesa ${tableForTitle.number}` : "Mesa";
    navigation.setOptions({ title });
  }, [navigation, tableForTitle]);

  if (!validId) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <Text style={styles.err}>Identificador de mesa inválido.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (query.isPending) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <ActivityIndicator size="large" color={welcomeTheme.orange} />
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <Text style={styles.err}>No se pudo cargar el detalle de la mesa.</Text>
        <Pressable style={styles.backBtn} onPress={() => query.refetch()}>
          <Text style={styles.backBtnText}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { table, openSession: session } = query.data;
  const total = query.data.totalAccumulated ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isPending}
            onRefresh={() => query.refetch()}
            tintColor={welcomeTheme.orange}
          />
        }
      >
        {!session ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Mesa {table.number}</Text>
            <View style={styles.card}>
              <Text style={styles.freeHint}>
                Esta mesa está libre. Abrila desde la pestaña Mesas para iniciar
                una sesión.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Bloque 1 — Resumen */}
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Resumen de mesa</Text>
              <View style={styles.card}>
                <SummaryRow label="Mesa" value={`N.º ${table.number}`} />
                <SummaryRow label="Mesero" value={session.waiter.name} />
                <SummaryRow
                  label="Personas"
                  value={String(session.guestCount)}
                />
                <SummaryRow
                  label="Abierta desde"
                  value={formatTime(session.openedAt)}
                  last
                />
              </View>
            </View>

            {/* Bloque 2 — Consumos */}
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Consumos</Text>
              <View style={styles.card}>
                {session.items.length === 0 ? (
                  <Text style={styles.emptyItems}>
                    Todavía no hay consumos registrados.
                  </Text>
                ) : (
                  session.items.map((line) => (
                    <View key={line.id} style={styles.consumptionRow}>
                      <View style={styles.consumptionMain}>
                        <Text style={styles.productName}>
                          {line.productName}
                        </Text>
                        <Text style={styles.productMeta}>
                          Cantidad {line.quantity}
                        </Text>
                        {line.note ? (
                          <Text style={styles.productNote}>
                            Nota: {line.note}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.consumptionRight}>
                        <Text style={styles.subtotal}>
                          {formatMoney(line.lineTotal)}
                        </Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.linkBtn,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => setEditItem(line)}
                        >
                          <Text style={styles.linkBtnText}>Editar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}

                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total acumulado</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatMoney(total)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bloque 3 — Acciones */}
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Acciones</Text>
              <View style={styles.actionsCol}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionPrimary,
                    pressed && styles.actionPressed,
                  ]}
                  onPress={() => setAddOpen(true)}
                >
                  <Text style={styles.actionPrimaryText}>Agregar consumo</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionSecondary,
                    pressed && styles.actionPressed,
                  ]}
                  onPress={() => setCloseOpen(true)}
                >
                  <Text style={styles.actionSecondaryText}>Cerrar mesa</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {session ? (
        <>
          <AddConsumptionModal
            visible={addOpen}
            sessionId={session.id}
            onClose={() => setAddOpen(false)}
            onAdded={refreshDetail}
          />
          <EditItemModal
            visible={editItem !== null}
            sessionId={session.id}
            item={editItem}
            onClose={() => setEditItem(null)}
            onChanged={refreshDetail}
          />
          <CloseSessionModal
            visible={closeOpen}
            sessionId={session.id}
            tableNumber={table.number}
            guestCount={session.guestCount}
            itemCount={session.items.length}
            total={total}
            onClose={() => setCloseOpen(false)}
            onClosed={refreshDetail}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, last && styles.summaryRowLast]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mesasTheme.surface,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: mesasTheme.surface,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 880,
    width: "100%",
    alignSelf: "center",
  },
  block: {
    marginBottom: 22,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: mesasTheme.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 4,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: mesasTheme.muted,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  freeHint: {
    fontSize: 15,
    color: mesasTheme.muted,
    lineHeight: 22,
    padding: 16,
  },
  emptyItems: {
    fontSize: 14,
    color: mesasTheme.muted,
    fontStyle: "italic",
    padding: 16,
  },
  consumptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  consumptionMain: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  productMeta: {
    fontSize: 13,
    color: mesasTheme.muted,
    marginTop: 6,
    lineHeight: 18,
  },
  productNote: {
    fontSize: 12,
    color: mesasTheme.muted,
    fontStyle: "italic",
    marginTop: 6,
    lineHeight: 17,
  },
  consumptionRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  linkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: welcomeTheme.orange,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: mesasTheme.surface,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
  actionsCol: {
    gap: 12,
  },
  actionPrimary: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  actionPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  actionSecondary: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#b00020",
    backgroundColor: "#fff",
  },
  actionSecondaryText: {
    color: "#b00020",
    fontSize: 16,
    fontWeight: "800",
  },
  actionPressed: {
    opacity: 0.9,
  },
  err: {
    fontSize: 15,
    color: "#b00020",
    textAlign: "center",
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: welcomeTheme.orange,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
