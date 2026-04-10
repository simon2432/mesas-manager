import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  fetchWaiters,
  toggleWaiterActive,
  type PublicWaiter,
} from "@/src/api/waiters.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

import { useConfirm } from "@/src/components/ui/ConfirmProvider";

import { WaiterFormModal } from "./WaiterFormModal";

export function WaitersCatalogScreen() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editWaiter, setEditWaiter] = useState<PublicWaiter | null>(null);

  const query = useQuery({
    queryKey: ["waiters"],
    queryFn: fetchWaiters,
  });

  const toggleMut = useMutation({
    mutationFn: toggleWaiterActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waiters"] });
    },
    onError: (e) => {
      Alert.alert(
        "Error",
        getApiErrorMessage(e, "No se pudo cambiar el estado."),
      );
    },
  });

  const filtered = useMemo(() => {
    const list = query.data ?? [];
    const q = search.trim().toLowerCase();
    const base = q
      ? list.filter((w) => w.name.toLowerCase().includes(q))
      : list;
    return [...base].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
  }, [query.data, search]);

  const openCreate = () => {
    setFormMode("create");
    setEditWaiter(null);
    setFormOpen(true);
  };

  const openEdit = (w: PublicWaiter) => {
    setFormMode("edit");
    setEditWaiter(w);
    setFormOpen(true);
  };

  const confirmToggle = (w: PublicWaiter) => {
    void (async () => {
      const deactivate = w.isActive;
      const ok = await confirm({
        title: deactivate ? "Desactivar mesero" : "Activar mesero",
        message: deactivate
          ? `${w.name} no podrá asignarse a nuevas mesas hasta reactivarlo.`
          : `${w.name} volverá a poder tomar mesas.`,
        confirmLabel: deactivate ? "Desactivar" : "Activar",
        destructive: deactivate,
      });
      if (ok) toggleMut.mutate(w.id);
    })();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Meseros</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={openCreate}
          >
            <Text style={styles.addBtnText}>+ Mesero</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre…"
          placeholderTextColor={mesasTheme.muted}
          autoCorrect={false}
        />

        {query.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={{ marginTop: 32 }}
          />
        ) : query.isError ? (
          <Text style={styles.err}>No se pudo cargar la lista.</Text>
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
                  : "No hay meseros. Creá el primero."}
              </Text>
            ) : (
              filtered.map((w) => (
                <View key={w.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.name}>{w.name}</Text>
                      <View
                        style={[
                          styles.badge,
                          w.isActive ? styles.badgeOn : styles.badgeOff,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            !w.isActive && styles.badgeTextOff,
                          ]}
                        >
                          {w.isActive ? "Activo" : "Inactivo"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => openEdit(w)}
                    >
                      <Text style={styles.linkText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => confirmToggle(w)}
                    >
                      <Text style={styles.linkTextMuted}>
                        {w.isActive ? "Desactivar" : "Activar"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <WaiterFormModal
        visible={formOpen}
        mode={formMode}
        waiter={editWaiter}
        onClose={() => {
          setFormOpen(false);
          setEditWaiter(null);
        }}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["waiters"] });
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
    marginBottom: 12,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: welcomeTheme.textDark,
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
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    flex: 1,
    minWidth: 160,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOn: {
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },
  badgeOff: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2e7d32",
    textTransform: "uppercase",
  },
  badgeTextOff: {
    color: mesasTheme.muted,
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
