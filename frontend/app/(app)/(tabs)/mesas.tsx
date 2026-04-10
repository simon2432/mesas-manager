import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchDashboardSummary } from "@/src/api/dashboard.api";
import { fetchTables } from "@/src/api/tables.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import type { PublicTable } from "@/src/types/tables.types";

const LOGO_SOURCE = require("../../../assets/images/mesas-logo.png");

const COLS = 4;
const GRID_GAP = 8;
const H_PAD = 16;

function tableCellStyle(occupied: boolean, active: boolean) {
  if (!active) {
    return [styles.cell, styles.cellInactive];
  }
  if (occupied) {
    return [styles.cell, styles.cellOccupied];
  }
  return [styles.cell, styles.cellFree];
}

function FooterStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function MesasScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const inner = width - H_PAD * 2 - GRID_GAP * (COLS - 1);
  const cellSize = Math.max(56, Math.floor(inner / COLS));

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
  });

  const tables: PublicTable[] = tablesQuery.data?.tables ?? [];
  const summary = summaryQuery.data;

  const totalCapacityActive = tables
    .filter((t) => t.isActive)
    .reduce((s, t) => s + t.capacity, 0);

  const occupancyPeople =
    summary && totalCapacityActive > 0
      ? `${summary.peopleSeated}/${totalCapacityActive}`
      : summary
        ? `${summary.peopleSeated}`
        : "—";

  const occupancyTables =
    summary != null
      ? `${summary.activeTables}/${summary.totalTables}`
      : "—";

  const ordersToday =
    summary != null ? String(summary.itemsSoldToday) : "—";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.layoutBtn,
            pressed && styles.layoutBtnPressed,
          ]}
          onPress={() => router.push("/layouts")}
        >
          <Text style={styles.layoutBtnText}>Layout mesas</Text>
        </Pressable>

        {tablesQuery.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : tablesQuery.isError ? (
          <Text style={styles.errorText}>No se pudieron cargar las mesas.</Text>
        ) : (
          <View
            style={[
              styles.grid,
              { gap: GRID_GAP, paddingHorizontal: H_PAD },
            ]}
          >
            {tables.map((t) => {
              const occupied = t.status === "OCCUPIED";
              return (
                <Pressable
                  key={t.id}
                  style={({ pressed }) => [
                    tableCellStyle(occupied, t.isActive),
                    {
                      width: cellSize,
                      height: cellSize,
                    },
                    pressed && styles.cellPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellNumber,
                      occupied && t.isActive && styles.cellNumberOnDark,
                    ]}
                  >
                    {t.number}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerHeading}>DASHBOARD</Text>
        <View style={styles.statsRow}>
          <FooterStat label="OCUP. MESAS" value={occupancyTables} />
          <FooterStat label="OCUP. GENTE" value={occupancyPeople} />
          <FooterStat label="ÍTEMS HOY" value={ordersToday} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: welcomeTheme.white,
  },
  topBar: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 10,
    paddingHorizontal: H_PAD,
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
    backgroundColor: welcomeTheme.white,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  layoutBtn: {
    alignSelf: "flex-start",
    marginLeft: H_PAD,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: welcomeTheme.white,
    borderWidth: 1,
    borderColor: welcomeTheme.textDark,
  },
  layoutBtnPressed: {
    opacity: 0.85,
  },
  layoutBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: welcomeTheme.textDark,
    letterSpacing: 0.4,
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    marginHorizontal: H_PAD,
    color: "#b00020",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cellFree: {
    backgroundColor: "#e8e8e8",
  },
  cellOccupied: {
    backgroundColor: "#8B1538",
  },
  cellInactive: {
    backgroundColor: "#c4c4c4",
    opacity: 0.65,
  },
  cellPressed: {
    opacity: 0.88,
  },
  cellNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  cellNumberOnDark: {
    color: welcomeTheme.white,
  },
  footer: {
    backgroundColor: welcomeTheme.orange,
    paddingHorizontal: H_PAD,
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
