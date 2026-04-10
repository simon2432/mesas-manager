import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchDashboardSummary } from "@/src/api/dashboard.api";
import { OperationalDayBar } from "@/src/components/ui/OperationalDayBar";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import { useOperationalDayStore } from "@/src/store/operationalDay.store";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "orange" | "green" | "muted";
}) {
  return (
    <View
      style={[
        styles.card,
        accent === "orange" && styles.cardAccentOrange,
        accent === "green" && styles.cardAccentGreen,
      ]}
    >
      <Text style={styles.cardLabel}>{label}</Text>
      <Text
        style={[
          styles.cardValue,
          accent === "orange" && styles.cardValueOrange,
          accent === "green" && styles.cardValueGreen,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function DashboardOperativoScreen() {
  const dateYmd = useOperationalDayStore((s) => s.dateYmd);

  const query = useQuery({
    queryKey: ["dashboard", "summary", dateYmd],
    queryFn: () => fetchDashboardSummary(dateYmd),
  });

  const s = query.data;
  const showLive = s?.isSelectedDateToday === true;

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
        <Text style={styles.screenTitle}>Operación</Text>
        <OperationalDayBar />
        <Text style={styles.hint}>
          El día se interpreta en hora local del servidor. Las métricas de
          mesas ocupadas y sesiones abiertas solo aplican cuando ese día es el
          actual en el servidor.
        </Text>

        {query.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : query.isError ? (
          <Text style={styles.err}>No se pudo cargar el resumen.</Text>
        ) : s ? (
          <View style={styles.grid}>
            <StatCard label="Total mesas" value={String(s.totalTables)} />
            {showLive ? (
              <>
                <StatCard
                  label="Mesas ocupadas"
                  value={String(s.activeTables)}
                  accent="orange"
                />
                <StatCard
                  label="Mesas libres"
                  value={String(s.freeTables)}
                  accent="green"
                />
                <StatCard
                  label="Sesiones activas"
                  value={String(s.activeSessions)}
                />
                <StatCard
                  label="Personas sentadas"
                  value={String(s.peopleSeated)}
                />
              </>
            ) : (
              <View style={styles.noticeWide}>
                <Text style={styles.noticeText}>
                  Para este día no se muestra el estado en vivo de mesas ni
                  sesiones abiertas (solo disponible para el día actual del
                  servidor).
                </Text>
              </View>
            )}
            <StatCard
              label={
                showLive ? "Ítems vendidos (día)" : "Ítems vendidos ese día"
              }
              value={String(s.itemsSoldToday)}
            />
            <View style={styles.cardWide}>
              <Text style={styles.cardLabel}>
                {showLive
                  ? "Facturación del día"
                  : "Facturación (sesiones que abrieron ese día)"}
              </Text>
              <Text style={[styles.cardValueLarge, styles.cardValueOrange]}>
                {formatMoney(s.revenueToday)}
              </Text>
              <Text style={styles.cardFoot}>
                Suma del total de sesiones que abrieron en la fecha elegida
                (si el día es hoy, incluye mesas aún abiertas).
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
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
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    minWidth: 148,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 16,
  },
  cardWide: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 16,
  },
  noticeWide: {
    width: "100%",
    backgroundColor: "rgba(92, 100, 112, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 14,
  },
  noticeText: {
    fontSize: 13,
    color: mesasTheme.muted,
    lineHeight: 19,
  },
  cardAccentOrange: {
    borderColor: "rgba(245, 124, 0, 0.35)",
    backgroundColor: "rgba(245, 124, 0, 0.06)",
  },
  cardAccentGreen: {
    borderColor: "rgba(46, 125, 50, 0.35)",
    backgroundColor: "rgba(46, 125, 50, 0.06)",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: mesasTheme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: -0.5,
  },
  cardValueLarge: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  cardValueOrange: {
    color: welcomeTheme.orange,
  },
  cardValueGreen: {
    color: "#2e7d32",
  },
  cardFoot: {
    marginTop: 10,
    fontSize: 12,
    color: mesasTheme.muted,
    lineHeight: 17,
  },
  loader: { marginTop: 40 },
  err: {
    color: "#b00020",
    fontSize: 15,
    marginTop: 16,
  },
});
