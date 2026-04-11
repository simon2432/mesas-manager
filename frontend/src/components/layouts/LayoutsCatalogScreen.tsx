import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import {
  deleteLayout,
  fetchLayoutById,
  fetchLayouts,
  type PublicLayout,
} from "@/src/api/layouts.api";
import { fetchTables, toggleTableActive } from "@/src/api/tables.api";
import { useConfirm } from "@/src/components/ui/ConfirmProvider";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";
import {
  type AppliedLayoutEntry,
  useAppliedLayoutStore,
} from "@/src/store/appliedLayout.store";
import {
  newLayoutOverlapsApplied,
  stripAppliedFromFrontUntilNoOverlap,
} from "@/src/utils/appliedLayouts.utils";
import {
  computeApplyLayoutPlan,
  type ApplyLayoutPlan,
} from "@/src/utils/applyLayoutPlan";

import { LayoutFormModal } from "./LayoutFormModal";

function formatTablesLine(layout: PublicLayout): string {
  if (layout.tables.length === 0) return "Sin mesas asignadas";
  const nums = [...layout.tables]
    .sort((a, b) => a.number - b.number)
    .map((t) => t.number);
  return `Mesas: ${nums.join(", ")}`;
}

export function LayoutsCatalogScreen() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editLayout, setEditLayout] = useState<PublicLayout | null>(null);
  const [applyingLayoutId, setApplyingLayoutId] = useState<number | null>(null);
  const [layoutConflict, setLayoutConflict] = useState<{
    layout: PublicLayout;
    plan: ApplyLayoutPlan;
  } | null>(null);

  const setAppliedLayouts = useAppliedLayoutStore((s) => s.setAppliedLayouts);

  const layoutsQuery = useQuery({
    queryKey: ["layouts"],
    queryFn: fetchLayouts,
  });

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const activeTables = useMemo(() => {
    const list = tablesQuery.data?.tables ?? [];
    return [...list]
      .filter((t) => t.isActive)
      .sort((a, b) => a.number - b.number);
  }, [tablesQuery.data?.tables]);

  const deleteMut = useMutation({
    mutationFn: deleteLayout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["layouts"] });
    },
    onError: (e) => {
      Alert.alert(
        "Error",
        getApiErrorMessage(e, "No se pudo eliminar el layout."),
      );
    },
  });

  const filtered = useMemo(() => {
    const list = layoutsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    const base = q
      ? list.filter((l) => l.name.toLowerCase().includes(q))
      : list;
    return [...base].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
  }, [layoutsQuery.data, search]);

  const openCreate = () => {
    setFormMode("create");
    setEditLayout(null);
    setFormOpen(true);
  };

  const openEdit = (l: PublicLayout) => {
    setFormMode("edit");
    setEditLayout(l);
    setFormOpen(true);
  };

  const confirmDelete = (l: PublicLayout) => {
    void (async () => {
      const ok = await confirm({
        title: "Eliminar layout",
        message: `¿Eliminar «${l.name}»? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        destructive: true,
      });
      if (ok) deleteMut.mutate(l.id);
    })();
  };

  const runApplyPlan = async (
    layout: PublicLayout,
    plan: ApplyLayoutPlan,
    nextApplied: AppliedLayoutEntry[],
  ) => {
    for (const tableId of plan.toggleIds) {
      await toggleTableActive(tableId);
    }
    const entry = {
      layoutId: layout.id,
      layoutName: layout.name,
      layoutTableIds: plan.inLayoutActiveIds,
    };
    setAppliedLayouts(nextApplied.concat(entry));
    await qc.invalidateQueries({ queryKey: ["tables"] });
    await qc.invalidateQueries({ queryKey: ["dashboard"] });

    let msg =
      "El layout quedó aplicado: en inicio verás sus mesas en el recuadro (hasta dos layouts, uno debajo del otro) y el resto de mesas activas abajo.";
    if (plan.skippedInactiveNumbers.length > 0) {
      msg += `\n\nMesas incluidas en el layout pero desactivadas en catálogo (no se reactivaron): ${plan.skippedInactiveNumbers.join(", ")}.`;
    }
    Alert.alert("Listo", msg);
  };

  const applyLayout = (l: PublicLayout) => {
    void (async () => {
      const ok = await confirm({
        title: "Aplicar layout",
        message: `Se activarán las mesas del layout «${l.name}» que estén apagadas. Las mesas activas que no formen parte del layout no se desactivan: seguirán visibles debajo de los recuadros en inicio. Podés tener hasta dos layouts activos si no comparten mesas.`,
        confirmLabel: "Aplicar",
        destructive: false,
      });
      if (!ok) return;

      setApplyingLayoutId(l.id);
      try {
        const [layout, { tables }] = await Promise.all([
          fetchLayoutById(l.id),
          fetchTables(),
        ]);
        const plan = computeApplyLayoutPlan(tables, layout.tables);
        const applied = useAppliedLayoutStore.getState().appliedLayouts;
        const newIds = plan.inLayoutActiveIds;

        if (applied.length >= 2 && !newLayoutOverlapsApplied(newIds, applied)) {
          Alert.alert(
            "Límite de layouts",
            "Solo podés tener dos layouts activos a la vez. En inicio usá «Quitar agrupación» y volvé a aplicar los que necesites.",
          );
          return;
        }

        if (newLayoutOverlapsApplied(newIds, applied)) {
          setLayoutConflict({ layout, plan });
          return;
        }

        await runApplyPlan(layout, plan, applied);
      } catch (e) {
        Alert.alert(
          "Error",
          getApiErrorMessage(e, "No se pudo aplicar el layout."),
        );
      } finally {
        setApplyingLayoutId(null);
      }
    })();
  };

  const closeConflict = () => setLayoutConflict(null);

  const confirmReplaceConflict = () => {
    const payload = layoutConflict;
    if (!payload) return;
    void (async () => {
      setLayoutConflict(null);
      setApplyingLayoutId(payload.layout.id);
      try {
        const applied = useAppliedLayoutStore.getState().appliedLayouts;
        const stripped = stripAppliedFromFrontUntilNoOverlap(
          applied,
          payload.plan.inLayoutActiveIds,
        );
        await runApplyPlan(payload.layout, payload.plan, stripped);
      } catch (e) {
        Alert.alert(
          "Error",
          getApiErrorMessage(e, "No se pudo aplicar el layout."),
        );
      } finally {
        setApplyingLayoutId(null);
      }
    })();
  };

  const loading = layoutsQuery.isPending || tablesQuery.isPending;
  const error = layoutsQuery.isError || tablesQuery.isError;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Layouts</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={openCreate}
          >
            <Text style={styles.addBtnText}>+ Layout</Text>
          </Pressable>
        </View>

        <Text style={styles.intro}>
          Configuraciones reutilizables de qué mesas entran en cada esquema (sin
          mapa visual).
        </Text>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre…"
          placeholderTextColor={mesasTheme.muted}
          autoCorrect={false}
        />

        {loading ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={{ marginTop: 32 }}
          />
        ) : error ? (
          <Text style={styles.err}>No se pudieron cargar los datos.</Text>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <Text style={styles.empty}>
                {search.trim()
                  ? "No hay coincidencias."
                  : "No hay layouts. Creá el primero."}
              </Text>
            ) : (
              filtered.map((l) => (
                <View key={l.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.name}>{l.name}</Text>
                    <Text style={styles.tablesLine}>{formatTablesLine(l)}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => applyLayout(l)}
                      disabled={
                        applyingLayoutId !== null ||
                        deleteMut.isPending ||
                        layoutConflict !== null
                      }
                    >
                      <Text
                        style={
                          applyingLayoutId === l.id
                            ? styles.linkTextMuted
                            : styles.linkText
                        }
                      >
                        {applyingLayoutId === l.id
                          ? "Aplicando…"
                          : "Aplicar layout"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => openEdit(l)}
                      disabled={applyingLayoutId !== null}
                    >
                      <Text style={styles.linkText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => confirmDelete(l)}
                      disabled={
                        deleteMut.isPending || applyingLayoutId !== null
                      }
                    >
                      <Text style={styles.linkDanger}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <LayoutFormModal
        visible={formOpen}
        mode={formMode}
        layout={editLayout}
        activeTables={activeTables}
        onClose={() => {
          setFormOpen(false);
          setEditLayout(null);
        }}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["layouts"] });
        }}
      />

      <Modal
        visible={layoutConflict !== null}
        transparent
        animationType="fade"
        onRequestClose={closeConflict}
      >
        <View style={mesasModalStyles.backdrop}>
          <Pressable style={mesasModalStyles.dim} onPress={closeConflict} />
          <View style={mesasModalStyles.sheet}>
            <Text style={mesasModalStyles.sheetTitle}>
              Layouts incompatibles
            </Text>
            <Text style={mesasModalStyles.sheetHint}>
              El layout «{layoutConflict?.layout.name ?? ""}» comparte mesas con
              uno o más layouts que ya tenés aplicados. No podés dejar ambos a
              la vez.
            </Text>
            <Text style={[mesasModalStyles.sheetHint, { marginTop: 10 }]}>
              Podés cerrar y no aplicar, o reemplazar: se quita el primer layout
              activo (y los siguientes que sigan chocando) y se aplica este.
            </Text>
            <Pressable
              style={({ pressed }) => [
                mesasModalStyles.primaryBtn,
                pressed && { opacity: 0.92 },
              ]}
              onPress={confirmReplaceConflict}
            >
              <Text style={mesasModalStyles.primaryBtnText}>Reemplazar</Text>
            </Pressable>
            <Pressable
              style={mesasModalStyles.ghostBtn}
              onPress={closeConflict}
            >
              <Text style={mesasModalStyles.ghostBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: mesasTheme.surface,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
  },
  intro: {
    fontSize: 14,
    color: mesasTheme.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  addBtn: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  search: {
    borderWidth: 1,
    borderColor: mesasTheme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 14,
    color: welcomeTheme.textDark,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 28 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 14,
    marginBottom: 10,
  },
  rowMain: { marginBottom: 10 },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    marginBottom: 6,
  },
  tablesLine: {
    fontSize: 14,
    color: mesasTheme.muted,
    lineHeight: 20,
  },
  rowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mesasTheme.border,
    paddingTop: 10,
  },
  linkBtn: { paddingVertical: 4 },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: welcomeTheme.orange,
  },
  linkDanger: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b00020",
  },
  linkTextMuted: {
    fontSize: 14,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  empty: {
    fontSize: 15,
    color: mesasTheme.muted,
    textAlign: "center",
    marginTop: 24,
  },
  err: {
    color: "#b00020",
    marginTop: 16,
    fontSize: 15,
  },
});
