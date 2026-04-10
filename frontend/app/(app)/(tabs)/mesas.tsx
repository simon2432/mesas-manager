import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useOperationalDayStore } from "@/src/store/operationalDay.store";
import { CreateTableModal } from "@/src/components/mesas/CreateTableModal";
import { EditTableModal } from "@/src/components/mesas/EditTableModal";
import { OpenSessionModal } from "@/src/components/mesas/OpenSessionModal";
import { TableCard } from "@/src/components/mesas/TableCard";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import type { PublicTable } from "@/src/types/tables.types";

const LOGO_SOURCE = require("../../../assets/images/mesas-logo.png");

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function useMesasGridLayout() {
  const { width } = useWindowDimensions();
  const horizontalPad = 16;
  const maxContent = Math.min(width - horizontalPad * 2, 1200);
  const gap = 12;
  const minCard = 172;
  let cols = Math.floor((maxContent + gap) / (minCard + gap));
  cols = Math.max(1, Math.min(4, cols));
  const cardWidth = (maxContent - gap * (cols - 1)) / cols;
  return { cardWidth, cols, contentWidth: maxContent, horizontalPad, gap };
}

export default function MesasScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { cardWidth, contentWidth, horizontalPad, gap } = useMesasGridLayout();
  const dateYmd = useOperationalDayStore((s) => s.dateYmd);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTable, setEditTable] = useState<PublicTable | null>(null);
  const [openSessionTable, setOpenSessionTable] = useState<PublicTable | null>(
    null,
  );

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", dateYmd],
    queryFn: () => fetchDashboardSummary(dateYmd),
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
      qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (e) => {
      Alert.alert(
        "No se pudo actualizar",
        getApiErrorMessage(e, "Intentá de nuevo en unos segundos."),
      );
    },
  });

  const sortedTables = useMemo(() => {
    const list = tablesQuery.data?.tables ?? [];
    return [...list].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.number - b.number;
    });
  }, [tablesQuery.data?.tables]);

  const tables: PublicTable[] = sortedTables;
  const summary = summaryQuery.data;

  const totalCapacityActive = tables
    .filter((t) => t.isActive)
    .reduce((s, t) => s + t.capacity, 0);

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

  const ordersToday = summary != null ? String(summary.itemsSoldToday) : "—";

  const invalidateMesas = () => {
    qc.invalidateQueries({ queryKey: ["tables"] });
    qc.invalidateQueries({ queryKey: ["dashboard", "summary"] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.topBar, { paddingHorizontal: horizontalPad }]}>
        <View style={styles.topBarInner}>
          <Image
            source={LOGO_SOURCE}
            style={styles.topLogo}
            resizeMode="contain"
            accessibilityLabel="Mesas Manager"
          />
          <Text style={styles.topTitle}>Mesas Manager</Text>
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
              styles.toolbarPrimary,
              pressed && styles.toolbarPressed,
            ]}
            onPress={() => setCreateOpen(true)}
          >
            <Text style={styles.toolbarPrimaryText}>+ Nueva mesa</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.toolbarSecondary,
              pressed && styles.toolbarPressed,
            ]}
            onPress={() => router.push("/layouts")}
          >
            <Text style={styles.toolbarSecondaryText}>Layouts</Text>
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
            No hay mesas cargadas. Creá la primera con &quot;Nueva mesa&quot;.
          </Text>
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

      <View style={[styles.footer, { paddingHorizontal: horizontalPad }]}>
        <Text style={styles.footerHeading}>DASHBOARD</Text>
        <View style={styles.statsRow}>
          <FooterStat label="OCUP. MESAS" value={occupancyTables} />
          <FooterStat label="OCUP. GENTE" value={occupancyPeople} />
          <FooterStat label="ÍTEMS DÍA" value={ordersToday} />
        </View>
      </View>

      <CreateTableModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={invalidateMesas}
      />

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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  topBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topLogo: {
    width: 36,
    height: 22,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: welcomeTheme.white,
    letterSpacing: 0.3,
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
  toolbarPrimary: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  toolbarPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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
  footer: {
    backgroundColor: welcomeTheme.orange,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerHeading: {
    fontSize: 10,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: welcomeTheme.white,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minHeight: 64,
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
});
