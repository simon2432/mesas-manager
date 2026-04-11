import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import { fetchTables, toggleTableActive } from "@/src/api/tables.api";
import { fetchWaiters } from "@/src/api/waiters.api";
import { CreateTableModal } from "@/src/components/mesas/CreateTableModal";
import { EditTableModal } from "@/src/components/mesas/EditTableModal";
import { OpenSessionModal } from "@/src/components/mesas/OpenSessionModal";
import { TableCard } from "@/src/components/mesas/TableCard";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import type { PublicTable } from "@/src/types/tables.types";

type FilterKey = "all" | "active" | "inactive";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "inactive", label: "Desactivadas" },
];

function useMesasGridLayout() {
  const { width } = useWindowDimensions();
  const horizontalPad = 16;
  const maxContent = Math.min(width - horizontalPad * 2, 1200);
  const gap = 12;
  const minCard = 172;
  let cols = Math.floor((maxContent + gap) / (minCard + gap));
  cols = Math.max(1, Math.min(4, cols));
  const cardWidth = (maxContent - gap * (cols - 1)) / cols;
  return { cardWidth, contentWidth: maxContent, horizontalPad, gap };
}

export function MesasGestionScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { cardWidth, contentWidth, horizontalPad, gap } = useMesasGridLayout();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTable, setEditTable] = useState<PublicTable | null>(null);
  const [openSessionTable, setOpenSessionTable] = useState<PublicTable | null>(
    null,
  );

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
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

  const filteredTables = useMemo(() => {
    const list = tablesQuery.data?.tables ?? [];
    const byFilter =
      filter === "all"
        ? list
        : filter === "active"
          ? list.filter((t) => t.isActive)
          : list.filter((t) => !t.isActive);
    return [...byFilter].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.number - b.number;
    });
  }, [tablesQuery.data?.tables, filter]);

  const invalidateMesas = () => {
    qc.invalidateQueries({ queryKey: ["tables"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const emptyMessage =
    filter === "active"
      ? "No hay mesas activas."
      : filter === "inactive"
        ? "No hay mesas desactivadas."
        : "No hay mesas cargadas. Creá la primera con «Nueva mesa».";

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { maxWidth: contentWidth }]}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => setCreateOpen(true)}
          >
            <Text style={styles.addBtnText}>+ Nueva mesa</Text>
          </Pressable>
        </View>

        <Text style={[styles.filterLabel, { maxWidth: contentWidth }]}>
          Mostrar
        </Text>
        <View
          style={[
            styles.filterRow,
            { maxWidth: contentWidth, width: "100%", alignSelf: "center" },
          ]}
        >
          {FILTERS.map((f) => {
            const selected = filter === f.key;
            return (
              <Pressable
                key={f.key}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected && styles.filterChipOn,
                  pressed && styles.pressed,
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selected && styles.filterChipTextOn,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tablesQuery.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={styles.loader}
          />
        ) : tablesQuery.isError ? (
          <Text style={styles.errorText}>No se pudieron cargar las mesas.</Text>
        ) : filteredTables.length === 0 ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
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
            {filteredTables.map((t) => (
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerRow: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 16,
  },
  addBtn: {
    alignSelf: "flex-start",
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },
  filterLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: mesasTheme.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    width: "100%",
    alignSelf: "center",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: "#fff",
  },
  filterChipOn: {
    backgroundColor: welcomeTheme.orange,
    borderColor: welcomeTheme.orange,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  filterChipTextOn: {
    color: "#fff",
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
