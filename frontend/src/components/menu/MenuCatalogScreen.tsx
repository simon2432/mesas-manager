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
  fetchMenuItems,
  toggleMenuItemActive,
  type PublicMenuItem,
} from "@/src/api/menu.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

import { useConfirm } from "@/src/components/ui/ConfirmProvider";

import { MenuItemFormModal } from "./MenuItemFormModal";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function MenuCatalogScreen() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editItem, setEditItem] = useState<PublicMenuItem | null>(null);

  const query = useQuery({
    queryKey: ["menu", "items"],
    queryFn: fetchMenuItems,
  });

  const toggleMut = useMutation({
    mutationFn: toggleMenuItemActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu", "items"] });
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
      ? list.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.description?.toLowerCase().includes(q) ?? false),
        )
      : list;
    return [...base].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
  }, [query.data, search]);

  const openCreate = () => {
    setFormMode("create");
    setEditItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: PublicMenuItem) => {
    setFormMode("edit");
    setEditItem(item);
    setFormOpen(true);
  };

  const confirmToggle = (item: PublicMenuItem) => {
    void (async () => {
      const isActive = item.isActive;
      const ok = await confirm({
        title: isActive ? "Desactivar producto" : "Activar producto",
        message: isActive
          ? `${item.name} no se podrá agregar a mesas hasta reactivarlo.`
          : `${item.name} volverá a estar disponible en el salón.`,
        confirmLabel: isActive ? "Desactivar" : "Activar",
        destructive: isActive,
      });
      if (ok) toggleMut.mutate(item.id);
    })();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menú</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={openCreate}
          >
            <Text style={styles.addBtnText}>+ Producto</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o descripción…"
          placeholderTextColor={mesasTheme.muted}
          autoCorrect={false}
        />

        {query.isPending ? (
          <ActivityIndicator
            color={welcomeTheme.orange}
            style={{ marginTop: 32 }}
          />
        ) : query.isError ? (
          <Text style={styles.err}>No se pudo cargar el menú.</Text>
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
                  : "Todavía no hay productos. Creá el primero."}
              </Text>
            ) : (
              filtered.map((item) => (
                <View key={item.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View
                        style={[
                          styles.badge,
                          item.isActive ? styles.badgeOn : styles.badgeOff,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            !item.isActive && styles.badgeTextOff,
                          ]}
                        >
                          {item.isActive ? "Activo" : "Inactivo"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatMoney(item.price)}
                    </Text>
                    {item.description ? (
                      <Text style={styles.itemDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => openEdit(item)}
                    >
                      <Text style={styles.linkText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.linkBtn}
                      onPress={() => confirmToggle(item)}
                    >
                      <Text style={styles.linkTextMuted}>
                        {item.isActive ? "Desactivar" : "Activar"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <MenuItemFormModal
        visible={formOpen}
        mode={formMode}
        item={editItem}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["menu", "items"] });
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
  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    flex: 1,
    minWidth: 120,
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
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeTheme.orange,
    marginTop: 6,
  },
  itemDesc: {
    fontSize: 13,
    color: mesasTheme.muted,
    marginTop: 8,
    lineHeight: 18,
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
