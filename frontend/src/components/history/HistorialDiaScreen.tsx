import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

import type { DailyClosedSessionRow } from "@/src/api/history.api";
import { fetchDailyClosedSessions } from "@/src/api/history.api";
import { OperationalDayBar } from "@/src/components/ui/OperationalDayBar";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import { useOperationalDayStore } from "@/src/store/operationalDay.store";

import { HistorySessionDetailModal } from "./HistorySessionDetailModal";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRange(opened: string, closed: string) {
  try {
    const o = new Date(opened);
    const c = new Date(closed);
    const dOpts: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${o.toLocaleString("es-AR", dOpts)} → ${c.toLocaleString("es-AR", dOpts)}`;
  } catch {
    return `${opened} → ${closed}`;
  }
}

export function HistorialDiaScreen() {
  const [detailId, setDetailId] = useState<number | null>(null);
  const dateYmd = useOperationalDayStore((s) => s.dateYmd);

  const query = useQuery({
    queryKey: ["history", "daily", dateYmd],
    queryFn: () => fetchDailyClosedSessions(dateYmd),
  });

  const rows = query.data ?? [];

  const openDetail = (row: DailyClosedSessionRow) => {
    setDetailId(row.sessionId);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isPending}
            onRefresh={() => query.refetch()}
            tintColor={welcomeTheme.orange}
          />
        }
      >
        <Text style={styles.screenTitle}>Historial</Text>
        <OperationalDayBar />
        <Text style={styles.hint}>
          Sesiones cerradas en la fecha elegida (cierre dentro de ese día,
          hora local del servidor). Tocá una fila para ver consumos.
        </Text>

        {query.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : query.isError ? (
          <Text style={styles.err}>No se pudo cargar el historial.</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.empty}>
            Todavía no hay sesiones cerradas en el día.
          </Text>
        ) : (
          rows.map((row) => (
            <Pressable
              key={row.sessionId}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() => openDetail(row)}
            >
              <View style={styles.rowTop}>
                <Text style={styles.tableBadge}>Mesa {row.tableNumber}</Text>
                <Text style={styles.total}>{formatMoney(row.total)}</Text>
              </View>
              <Text style={styles.waiter}>{row.waiterName}</Text>
              <Text style={styles.people}>
                {row.guestCount}{" "}
                {row.guestCount === 1 ? "persona" : "personas"}
              </Text>
              <Text style={styles.times}>
                {formatRange(row.openedAt, row.closedAt)}
              </Text>
              <Text style={styles.chev}>Ver detalle ›</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <HistorySessionDetailModal
        visible={detailId !== null}
        sessionId={detailId}
        dateYmd={dateYmd}
        onClose={() => setDetailId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mesasTheme.surface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginTop: 8,
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: mesasTheme.muted,
    lineHeight: 18,
    marginBottom: 18,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 16,
    marginBottom: 10,
  },
  rowPressed: {
    opacity: 0.92,
    backgroundColor: mesasTheme.freeTint,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tableBadge: {
    fontSize: 15,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  total: {
    fontSize: 17,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
  waiter: {
    fontSize: 15,
    fontWeight: "600",
    color: welcomeTheme.textDark,
    marginBottom: 4,
  },
  people: {
    fontSize: 14,
    color: mesasTheme.muted,
    marginBottom: 6,
  },
  times: {
    fontSize: 13,
    color: mesasTheme.muted,
    lineHeight: 18,
  },
  chev: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: welcomeTheme.orange,
  },
  loader: { marginTop: 40 },
  err: {
    color: "#b00020",
    fontSize: 15,
    marginTop: 16,
  },
  empty: {
    fontSize: 15,
    color: mesasTheme.muted,
    lineHeight: 22,
    marginTop: 12,
  },
});
