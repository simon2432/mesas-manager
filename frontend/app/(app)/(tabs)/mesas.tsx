import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import { fetchDashboardSummary } from "@/src/api/dashboard.api";
import { fetchTables, toggleTableActive } from "@/src/api/tables.api";
import { fetchWaiters } from "@/src/api/waiters.api";
import { useAppliedLayoutStore } from "@/src/store/appliedLayout.store";
import { effectiveTodayYmd } from "@/src/store/operationalDay.store";
import { EditTableModal } from "@/src/components/mesas/EditTableModal";
import { OpenSessionModal } from "@/src/components/mesas/OpenSessionModal";
import { TableCard } from "@/src/components/mesas/TableCard";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import type { PublicTable } from "@/src/types/tables.types";
import { useMesasCardGridLayout } from "@/src/utils/mesasCardGridLayout";

const LOGO_SOURCE = require("../../../assets/images/mesas-logo.png");

function HeaderDashStat({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <View
      style={[styles.headerStat, Platform.OS === "web" && styles.headerStatWeb]}
    >
      <Text
        style={[
          styles.headerStatLabel,
          compact && styles.headerStatLabelCompact,
        ]}
        numberOfLines={3}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.headerStatValue,
          compact && styles.headerStatValueCompact,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const COMPACT_TOP_BAR_BREAKPOINT = 540;

export default function MesasScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { width: windowWidth } = useWindowDimensions();
  const compactTopBar = windowWidth < COMPACT_TOP_BAR_BREAKPOINT;
  const { cardWidth, contentWidth, horizontalPad, gap } =
    useMesasCardGridLayout();
  const headerSummaryYmd = effectiveTodayYmd();
  const appliedLayouts = useAppliedLayoutStore((s) => s.appliedLayouts);
  const removeAppliedLayout = useAppliedLayoutStore(
    (s) => s.removeAppliedLayout,
  );

  const [editTable, setEditTable] = useState<PublicTable | null>(null);
  const [openSessionTable, setOpenSessionTable] = useState<PublicTable | null>(
    null,
  );

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", headerSummaryYmd],
    queryFn: () => fetchDashboardSummary(headerSummaryYmd),
  });

  const waitersQuery = useQuery({
    queryKey: ["waiters"],
    queryFn: fetchWaiters,
    staleTime: 60_000,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTableActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => {
      Alert.alert(
        "No se pudo actualizar",
        getApiErrorMessage(e, "Intentá de nuevo en unos segundos."),
      );
    },
  });

  const tables = useMemo(() => {
    const list = tablesQuery.data?.tables ?? [];
    return [...list]
      .filter((t) => t.isActive)
      .sort((a, b) => a.number - b.number);
  }, [tablesQuery.data?.tables]);

  const appliedIdSet = useMemo(() => {
    const s = new Set<number>();
    for (const e of appliedLayouts) {
      for (const id of e.layoutTableIds) s.add(id);
    }
    return s;
  }, [appliedLayouts]);

  const tablesByAppliedLayout = useMemo(() => {
    return appliedLayouts.map((entry) => ({
      entry,
      tables: tables.filter((t) => entry.layoutTableIds.includes(t.id)),
    }));
  }, [appliedLayouts, tables]);

  const tablesOutsideAppliedLayout = useMemo(() => {
    if (appliedLayouts.length === 0) return tables;
    return tables.filter((t) => !appliedIdSet.has(t.id));
  }, [tables, appliedLayouts.length, appliedIdSet]);

  const summary = summaryQuery.data;

  const totalCapacityActive = tables.reduce((s, t) => s + t.capacity, 0);

  const occupancyPeople =
    summary != null && summary.peopleSeated != null
      ? totalCapacityActive > 0
        ? `${summary.peopleSeated}/${totalCapacityActive}`
        : `${summary.peopleSeated}`
      : "—";

  const occupancyTables =
    summary != null && summary.activeTables != null
      ? `${summary.activeTables}/${summary.totalTables}`
      : "—";

  const invalidateMesas = () => {
    qc.invalidateQueries({ queryKey: ["tables"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.topBar, { paddingHorizontal: horizontalPad }]}>
        <View
          style={[
            styles.topBarInner,
            compactTopBar && styles.topBarInnerCompact,
          ]}
        >
          <Image
            source={LOGO_SOURCE}
            style={[styles.topLogo, compactTopBar && styles.topLogoCompact]}
            resizeMode="contain"
            accessibilityLabel="Mesas Manager"
          />
          <View
            style={[
              styles.headerStatsRow,
              compactTopBar && styles.headerStatsRowFullWidth,
              Platform.OS === "web" && styles.headerStatsRowWeb,
            ]}
          >
            {summaryQuery.isPending ? (
              <View style={styles.headerStatsLoading}>
                <ActivityIndicator size="small" color={welcomeTheme.textDark} />
              </View>
            ) : (
              <>
                <HeaderDashStat
                  compact={compactTopBar}
                  label="OCUP. MESAS"
                  value={occupancyTables}
                />
                <HeaderDashStat
                  compact={compactTopBar}
                  label="OCUP. GENTE"
                  value={occupancyPeople}
                />
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.toolbar,
            { maxWidth: contentWidth, width: "100%", alignSelf: "center" },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.toolbarSecondary,
              pressed && styles.toolbarPressed,
            ]}
            onPress={() => router.push("/layouts")}
          >
            <Text style={styles.toolbarSecondaryText}>Layouts</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.toolbarSecondary,
              pressed && styles.toolbarPressed,
            ]}
            onPress={() => router.push("/gestion-mesas")}
          >
            <Text style={styles.toolbarSecondaryText}>Gestión mesas</Text>
          </Pressable>
        </View>

        {tablesQuery.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : tablesQuery.isError ? (
          <Text style={styles.errorText}>No se pudieron cargar las mesas.</Text>
        ) : tables.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay mesas activas. Creá o activá mesas en &quot;Gestión
            mesas&quot;.
          </Text>
        ) : appliedLayouts.length > 0 ? (
          <View
            style={{
              width: contentWidth,
              maxWidth: "100%",
              alignSelf: "center",
            }}
          >
            {tablesByAppliedLayout.map(
              ({ entry, tables: groupTables }, idx) => (
                <View key={entry.layoutId} style={styles.layoutFrame}>
                  <View style={styles.layoutFrameHeader}>
                    <View style={styles.layoutFrameHeaderTitles}>
                      <Text style={styles.layoutFrameLabel}>
                        {appliedLayouts.length > 1
                          ? `Layout activo ${idx + 1} de ${appliedLayouts.length}`
                          : "Layout activo"}
                      </Text>
                      <Text style={styles.layoutFrameTitle}>
                        {entry.layoutName}
                      </Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.layoutFrameDismiss,
                        pressed && styles.toolbarPressed,
                      ]}
                      onPress={() => removeAppliedLayout(entry.layoutId)}
                      accessibilityLabel="Quitar agrupación de este layout"
                    >
                      <Text style={styles.layoutFrameDismissText}>
                        Quitar agrupación
                      </Text>
                    </Pressable>
                  </View>
                  {groupTables.length === 0 ? (
                    <Text style={styles.layoutFrameEmpty}>
                      Ninguna mesa activa de este layout en el salón.
                    </Text>
                  ) : (
                    <View style={[styles.cardGrid, { gap }]}>
                      {groupTables.map((t) => (
                        <TableCard
                          key={t.id}
                          table={t}
                          width={cardWidth}
                          onOpenSession={setOpenSessionTable}
                          onViewDetail={(table) =>
                            router.push(`/mesa/${table.id}` as Href)
                          }
                          onEdit={setEditTable}
                          onToggleActive={(table) =>
                            toggleMutation.mutate(table.id)
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              ),
            )}

            {tablesOutsideAppliedLayout.length > 0 ? (
              <>
                <Text style={styles.outsideSectionTitle}>
                  Otras mesas activas
                </Text>
                <Text style={styles.outsideSectionHint}>
                  Mesas activas que no forman parte de ninguno de los layouts
                  aplicados (siguen igual al aplicarlos).
                </Text>
                <View
                  style={[
                    styles.cardGrid,
                    {
                      width: contentWidth,
                      maxWidth: "100%",
                      alignSelf: "center",
                      gap,
                    },
                  ]}
                >
                  {tablesOutsideAppliedLayout.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      width={cardWidth}
                      onOpenSession={setOpenSessionTable}
                      onViewDetail={(table) =>
                        router.push(`/mesa/${table.id}` as Href)
                      }
                      onEdit={setEditTable}
                      onToggleActive={(table) =>
                        toggleMutation.mutate(table.id)
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.cardGrid,
              {
                width: contentWidth,
                maxWidth: "100%",
                alignSelf: "center",
                gap,
              },
            ]}
          >
            {tables.map((t) => (
              <TableCard
                key={t.id}
                table={t}
                width={cardWidth}
                onOpenSession={setOpenSessionTable}
                onViewDetail={(table) =>
                  router.push(`/mesa/${table.id}` as Href)
                }
                onEdit={setEditTable}
                onToggleActive={(table) => toggleMutation.mutate(table.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <EditTableModal
        visible={editTable !== null}
        table={editTable}
        onClose={() => setEditTable(null)}
        onSaved={invalidateMesas}
      />

      <OpenSessionModal
        key={openSessionTable?.id ?? "closed"}
        visible={openSessionTable !== null}
        table={openSessionTable}
        waiters={waitersQuery.data ?? []}
        waitersLoading={waitersQuery.isPending}
        onClose={() => setOpenSessionTable(null)}
        onOpened={(tableId) => {
          invalidateMesas();
          router.push(`/mesa/${tableId}` as Href);
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
  topBar: {
    backgroundColor: welcomeTheme.orange,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  topBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  topBarInnerCompact: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  headerStatsRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 6,
    minWidth: 0,
  },
  headerStatsRowFullWidth: {
    flex: 0,
    width: "100%",
    alignSelf: "stretch",
  },
  headerStatsRowWeb: {
    maxWidth: 360,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    gap: 12,
  },
  headerStatsLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    minHeight: 56,
  },
  headerStat: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 11,
  },
  headerStatWeb: {
    flexGrow: 1,
    flexBasis: 0,
    maxWidth: 172,
    minWidth: 120,
  },
  headerStatLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
    fontSize: 11,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: 0.12,
    opacity: 0.92,
    textAlign: "left",
    lineHeight: 13,
  },
  headerStatLabelCompact: {
    fontSize: 9,
    letterSpacing: 0.06,
    lineHeight: 11,
    marginRight: 4,
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    flexShrink: 0,
  },
  headerStatValueCompact: {
    fontSize: 15,
  },
  topLogo: {
    width: 88,
    height: 58,
  },
  topLogoCompact: {
    width: 80,
    height: 52,
    alignSelf: "center",
  },
  scroll: {
    flex: 1,
    backgroundColor: mesasTheme.surface,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  toolbarSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: welcomeTheme.textDark,
    backgroundColor: "#fff",
  },
  toolbarSecondaryText: {
    color: welcomeTheme.textDark,
    fontSize: 15,
    fontWeight: "600",
  },
  toolbarPressed: {
    opacity: 0.88,
  },
  layoutFrame: {
    borderWidth: 2,
    borderColor: welcomeTheme.orange,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  layoutFrameHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  layoutFrameHeaderTitles: {
    flex: 1,
    minWidth: 0,
  },
  layoutFrameDismiss: {
    flexShrink: 0,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: mesasTheme.surface,
  },
  layoutFrameDismissText: {
    color: mesasTheme.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  layoutFrameLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: welcomeTheme.orange,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  layoutFrameTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  layoutFrameEmpty: {
    fontSize: 14,
    color: mesasTheme.muted,
    lineHeight: 20,
  },
  outsideSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginBottom: 4,
  },
  outsideSectionHint: {
    fontSize: 12,
    color: mesasTheme.muted,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: "#b00020",
    fontSize: 14,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    color: mesasTheme.muted,
    lineHeight: 22,
    marginTop: 8,
  },
});
