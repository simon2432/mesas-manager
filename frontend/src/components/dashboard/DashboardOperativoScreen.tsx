import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import {
  fetchDashboardRangeSummary,
  fetchDashboardSummary,
} from "@/src/api/dashboard.api";
import { CalendarPickModal } from "@/src/components/ui/CalendarPickModal";
import { OperationalDayBar } from "@/src/components/ui/OperationalDayBar";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import {
  deviceLocalYmd,
  effectiveTodayYmd,
  useOperationalDayStore,
} from "@/src/store/operationalDay.store";

const MAX_RANGE_DAYS = 366;

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatYmdShort(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  try {
    return dt.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function inclusiveLocalDayCount(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const a = new Date(fy, fm - 1, fd).getTime();
  const b = new Date(ty, tm - 1, td).getTime();
  return Math.floor((b - a) / 86_400_000) + 1;
}

function defaultRangeFromYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return deviceLocalYmd(d);
}

function StatCard({
  label,
  value,
  accent,
  compact,
  fullWidth,
}: {
  label: string;
  value: string;
  accent?: "orange" | "green" | "muted";
  compact?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        fullWidth ? styles.cardFullWidth : styles.cardHalf,
        compact && styles.cardCompactPad,
        accent === "orange" && styles.cardAccentOrange,
        accent === "green" && styles.cardAccentGreen,
      ]}
    >
      <Text style={[styles.cardLabel, compact && styles.cardLabelCompact]}>
        {label}
      </Text>
      <Text
        style={[
          styles.cardValue,
          compact && styles.cardValueCompact,
          accent === "orange" && styles.cardValueOrange,
          accent === "green" && styles.cardValueGreen,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit={compact}
        minimumFontScale={compact ? 0.75 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

type DashboardMode = "day" | "range";

const COMPACT_BREAKPOINT = 480;
const SINGLE_COLUMN_STATS_BREAKPOINT = 380;

export function DashboardOperativoScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const compact = windowWidth < COMPACT_BREAKPOINT;
  const statsSingleColumn = windowWidth < SINGLE_COLUMN_STATS_BREAKPOINT;

  const dateYmd = useOperationalDayStore((s) => s.dateYmd);
  const [mode, setMode] = useState<DashboardMode>("day");
  const [rangeFrom, setRangeFrom] = useState(defaultRangeFromYmd);
  const [rangeTo, setRangeTo] = useState(() => effectiveTodayYmd());
  const [calTarget, setCalTarget] = useState<null | "from" | "to">(null);

  const clampRangeToToday = useCallback(() => {
    const t = effectiveTodayYmd();
    setRangeTo((prev) => (prev > t ? t : prev));
    setRangeFrom((prev) => {
      if (prev > t) return t;
      return prev;
    });
  }, []);

  useEffect(() => {
    if (mode === "range") clampRangeToToday();
  }, [mode, clampRangeToToday]);

  useEffect(() => {
    if (rangeFrom > rangeTo) {
      setRangeTo(rangeFrom);
    }
  }, [rangeFrom, rangeTo]);

  const rangeDayCount = useMemo(
    () => inclusiveLocalDayCount(rangeFrom, rangeTo),
    [rangeFrom, rangeTo],
  );

  const rangeTooLong = rangeDayCount > MAX_RANGE_DAYS;

  const dayQuery = useQuery({
    queryKey: ["dashboard", "summary", dateYmd],
    queryFn: () => fetchDashboardSummary(dateYmd),
    enabled: mode === "day",
  });

  const rangeQuery = useQuery({
    queryKey: ["dashboard", "summary-range", rangeFrom, rangeTo],
    queryFn: () => fetchDashboardRangeSummary(rangeFrom, rangeTo),
    enabled: mode === "range" && !rangeTooLong,
  });

  const s = dayQuery.data;
  const r = rangeQuery.data;
  const showLive = s?.isSelectedDateToday === true;
  const showPastDayNotice =
    mode === "day" &&
    (s != null
      ? s.isSelectedDateToday === false
      : dateYmd !== effectiveTodayYmd());

  const activeQuery = mode === "day" ? dayQuery : rangeQuery;
  const onRefresh = () => {
    void activeQuery.refetch();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.scrollContentCompact,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={activeQuery.isFetching && !activeQuery.isPending}
            onRefresh={onRefresh}
            tintColor={welcomeTheme.orange}
          />
        }
      >
        <Text
          style={[styles.screenTitle, compact && styles.screenTitleCompact]}
        >
          Operación
        </Text>

        <View style={[styles.modeRow, compact && styles.modeRowCompact]}>
          <Pressable
            style={({ pressed }) => [
              styles.modeChip,
              compact && styles.modeChipCompact,
              mode === "day" && styles.modeChipActive,
              pressed && styles.modeChipPressed,
            ]}
            onPress={() => setMode("day")}
          >
            <Text
              style={[
                styles.modeChipText,
                compact && styles.modeChipTextCompact,
                mode === "day" && styles.modeChipTextActive,
              ]}
            >
              Un día
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.modeChip,
              compact && styles.modeChipCompact,
              mode === "range" && styles.modeChipActive,
              pressed && styles.modeChipPressed,
            ]}
            onPress={() => setMode("range")}
          >
            <Text
              style={[
                styles.modeChipText,
                compact && styles.modeChipTextCompact,
                mode === "range" && styles.modeChipTextActive,
              ]}
            >
              Período
            </Text>
          </Pressable>
        </View>

        {mode === "day" ? (
          <OperationalDayBar />
        ) : (
          <View
            style={[styles.rangeBlock, compact && styles.rangeBlockCompact]}
          >
            <Text
              style={[styles.rangeHint, compact && styles.rangeHintCompact]}
            >
              Elegí desde y hasta (inclusive). Máximo {MAX_RANGE_DAYS} días. No
              se incluyen fechas futuras.
            </Text>
            <View style={[styles.rangeRow, compact && styles.rangeRowStacked]}>
              <Text
                style={[styles.rangeLabel, compact && styles.rangeLabelStacked]}
              >
                Desde
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.rangeDateBtn,
                  pressed && styles.rangeDateBtnPressed,
                ]}
                onPress={() => setCalTarget("from")}
              >
                <Text style={styles.rangeDateBtnText}>
                  {formatYmdShort(rangeFrom)}
                </Text>
                <Text style={styles.rangeDateSub}>{rangeFrom}</Text>
              </Pressable>
            </View>
            <View style={[styles.rangeRow, compact && styles.rangeRowStacked]}>
              <Text
                style={[styles.rangeLabel, compact && styles.rangeLabelStacked]}
              >
                Hasta
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.rangeDateBtn,
                  pressed && styles.rangeDateBtnPressed,
                ]}
                onPress={() => setCalTarget("to")}
              >
                <Text style={styles.rangeDateBtnText}>
                  {formatYmdShort(rangeTo)}
                </Text>
                <Text style={styles.rangeDateSub}>{rangeTo}</Text>
              </Pressable>
            </View>
            {rangeTooLong ? (
              <Text style={styles.rangeErr}>
                Acortá el rango: el máximo permitido es {MAX_RANGE_DAYS} días.
              </Text>
            ) : null}
          </View>
        )}

        {showPastDayNotice ? (
          <View
            style={[
              styles.noticeWide,
              compact && styles.noticeWideCompact,
              { marginBottom: 16 },
            ]}
          >
            <Text
              style={[styles.noticeText, compact && styles.noticeTextCompact]}
            >
              Para este día no se muestra el estado en vivo de mesas ni sesiones
              abiertas (solo disponible para el día actual del servidor).
            </Text>
          </View>
        ) : null}

        {mode === "range" ? (
          <View
            style={[
              styles.noticeWide,
              compact && styles.noticeWideCompact,
              { marginBottom: 16 },
            ]}
          >
            <Text
              style={[styles.noticeText, compact && styles.noticeTextCompact]}
            >
              Totales del período: ítems por fecha de registro; facturación,
              personas y sesiones por fecha de apertura de la mesa.
            </Text>
          </View>
        ) : null}

        {mode === "day" ? (
          dayQuery.isPending ? (
            <ActivityIndicator
              color={welcomeTheme.orange}
              style={styles.loader}
            />
          ) : dayQuery.isError ? (
            <Text style={styles.err}>
              {getApiErrorMessage(
                dayQuery.error,
                "No se pudo cargar el resumen.",
              )}
            </Text>
          ) : s ? (
            <View
              style={[
                styles.grid,
                statsSingleColumn && styles.gridSingleColumn,
                compact && styles.gridCompactGap,
              ]}
            >
              <StatCard
                label="Total mesas"
                value={String(s.totalTables)}
                compact={compact}
                fullWidth={statsSingleColumn}
              />
              {showLive ? (
                <>
                  <StatCard
                    label="Mesas ocupadas"
                    value={String(s.activeTables)}
                    accent="orange"
                    compact={compact}
                    fullWidth={statsSingleColumn}
                  />
                  <StatCard
                    label="Mesas libres"
                    value={String(s.freeTables)}
                    accent="green"
                    compact={compact}
                    fullWidth={statsSingleColumn}
                  />
                  <StatCard
                    label="Sesiones activas"
                    value={String(s.activeSessions)}
                    compact={compact}
                    fullWidth={statsSingleColumn}
                  />
                  <StatCard
                    label="Personas sentadas"
                    value={String(s.peopleSeated)}
                    compact={compact}
                    fullWidth={statsSingleColumn}
                  />
                </>
              ) : (
                <StatCard
                  label="Total personas ese día"
                  value={String(s.totalPeopleThatDay ?? 0)}
                  compact={compact}
                  fullWidth={statsSingleColumn}
                />
              )}
              <StatCard
                label={
                  showLive ? "Ítems vendidos (día)" : "Ítems vendidos ese día"
                }
                value={String(s.itemsSoldToday)}
                compact={compact}
                fullWidth={statsSingleColumn}
              />
              <View
                style={[styles.cardWide, compact && styles.cardWideCompact]}
              >
                <Text
                  style={[styles.cardLabel, compact && styles.cardLabelCompact]}
                >
                  {showLive
                    ? "Facturación del día"
                    : "Facturación (sesiones que abrieron ese día)"}
                </Text>
                <Text
                  style={[
                    styles.cardValueLarge,
                    styles.cardValueOrange,
                    compact && styles.cardValueLargeCompact,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={compact}
                  minimumFontScale={compact ? 0.65 : 1}
                >
                  {formatMoney(s.revenueToday)}
                </Text>
                <Text
                  style={[styles.cardFoot, compact && styles.cardFootCompact]}
                >
                  Suma del total de sesiones que abrieron en la fecha elegida
                  (si el día es hoy, incluye mesas aún abiertas).
                </Text>
              </View>
            </View>
          ) : null
        ) : rangeTooLong ? null : rangeQuery.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : rangeQuery.isError ? (
          <Text style={styles.err}>
            {getApiErrorMessage(
              rangeQuery.error,
              "No se pudo cargar el resumen del período.",
            )}
          </Text>
        ) : r ? (
          <View
            style={[
              styles.grid,
              statsSingleColumn && styles.gridSingleColumn,
              compact && styles.gridCompactGap,
            ]}
          >
            <StatCard
              label="Días en el período"
              value={String(r.dayCountInclusive)}
              compact={compact}
              fullWidth={statsSingleColumn}
            />
            <StatCard
              label="Total mesas"
              value={String(r.totalTables)}
              compact={compact}
              fullWidth={statsSingleColumn}
            />
            <StatCard
              label="Sesiones abiertas"
              value={String(r.sessionsOpened)}
              accent="orange"
              compact={compact}
              fullWidth={statsSingleColumn}
            />
            <StatCard
              label="Personas (comensales)"
              value={String(r.totalPeople)}
              compact={compact}
              fullWidth={statsSingleColumn}
            />
            <StatCard
              label="Ítems vendidos"
              value={String(r.itemsSold)}
              compact={compact}
              fullWidth={statsSingleColumn}
            />
            <View style={[styles.cardWide, compact && styles.cardWideCompact]}>
              <Text
                style={[styles.cardLabel, compact && styles.cardLabelCompact]}
              >
                Facturación del período
              </Text>
              <Text
                style={[
                  styles.cardValueLarge,
                  styles.cardValueOrange,
                  compact && styles.cardValueLargeCompact,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={compact}
                minimumFontScale={compact ? 0.65 : 1}
              >
                {formatMoney(r.revenue)}
              </Text>
              <Text
                style={[styles.cardFoot, compact && styles.cardFootCompact]}
              >
                Suma del total facturado en sesiones que abrieron entre{" "}
                {formatYmdShort(r.from)} y {formatYmdShort(r.to)}.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <CalendarPickModal
        visible={calTarget !== null}
        title={calTarget === "from" ? "Fecha desde" : "Fecha hasta"}
        valueYmd={calTarget === "from" ? rangeFrom : rangeTo}
        minYmd={calTarget === "to" ? rangeFrom : undefined}
        maxYmd={calTarget === "from" ? rangeTo : effectiveTodayYmd()}
        onClose={() => setCalTarget(null)}
        onConfirm={(ymd) => {
          const t = effectiveTodayYmd();
          if (calTarget === "from") {
            const nextFrom = ymd > t ? t : ymd;
            setRangeFrom(nextFrom);
            setRangeTo((prev) => {
              const cap = prev > t ? t : prev;
              return cap < nextFrom ? nextFrom : cap;
            });
          } else if (calTarget === "to") {
            const nextTo = ymd > t ? t : ymd;
            setRangeTo(nextTo);
            setRangeFrom((prev) => (prev > nextTo ? nextTo : prev));
          }
        }}
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
  scrollContentCompact: {
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginTop: 8,
    marginBottom: 10,
  },
  screenTitleCompact: {
    fontSize: 19,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  modeRowCompact: {
    marginBottom: 10,
    gap: 6,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: "#fff",
  },
  modeChipCompact: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  modeChipActive: {
    borderColor: welcomeTheme.orange,
    backgroundColor: "rgba(245, 124, 0, 0.1)",
  },
  modeChipPressed: { opacity: 0.88 },
  modeChipText: {
    fontSize: 15,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  modeChipTextActive: {
    color: welcomeTheme.orange,
  },
  modeChipTextCompact: {
    fontSize: 14,
  },
  rangeBlock: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
  },
  rangeBlockCompact: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  rangeHint: {
    fontSize: 13,
    color: mesasTheme.muted,
    lineHeight: 19,
    marginBottom: 14,
  },
  rangeHintCompact: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  rangeRowStacked: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
  },
  rangeLabel: {
    width: 52,
    fontSize: 14,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  rangeLabelStacked: {
    width: "100%",
    fontSize: 12,
    marginBottom: 2,
  },
  rangeDateBtn: {
    flex: 1,
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: mesasTheme.surface,
  },
  rangeDateBtnPressed: { opacity: 0.9 },
  rangeDateBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    textTransform: "capitalize",
  },
  rangeDateSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: mesasTheme.muted,
  },
  rangeErr: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#b00020",
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridSingleColumn: {
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  gridCompactGap: {
    gap: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 16,
  },
  cardHalf: {
    width: "47%",
    flexGrow: 1,
    minWidth: 0,
  },
  cardFullWidth: {
    width: "100%",
    minWidth: 0,
  },
  cardCompactPad: {
    padding: 12,
    borderRadius: 10,
  },
  cardWide: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 16,
  },
  cardWideCompact: {
    padding: 12,
    borderRadius: 10,
  },
  noticeWide: {
    width: "100%",
    backgroundColor: "rgba(92, 100, 112, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 14,
  },
  noticeWideCompact: {
    padding: 12,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 13,
    color: mesasTheme.muted,
    lineHeight: 19,
  },
  noticeTextCompact: {
    fontSize: 12,
    lineHeight: 17,
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
  cardLabelCompact: {
    fontSize: 10,
    letterSpacing: 0.35,
    marginBottom: 6,
    lineHeight: 14,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: -0.5,
  },
  cardValueCompact: {
    fontSize: 21,
    letterSpacing: -0.35,
  },
  cardValueLarge: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  cardValueLargeCompact: {
    fontSize: 22,
    letterSpacing: -0.4,
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
  cardFootCompact: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 15,
  },
  loader: { marginTop: 40 },
  err: {
    color: "#b00020",
    fontSize: 15,
    marginTop: 16,
    lineHeight: 21,
  },
});
