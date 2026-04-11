import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";
import {
  cardShadowStyle,
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import type { PublicTable } from "@/src/types/tables.types";

type Props = {
  table: PublicTable;
  width: number;
  onOpenSession: (t: PublicTable) => void;
  onViewDetail: (t: PublicTable) => void;
  onEdit: (t: PublicTable) => void;
  onToggleActive: (t: PublicTable) => void;
};

type MenuPhase = "closed" | "actions" | "confirmDeactivate";

export function TableCard({
  table,
  width,
  onOpenSession,
  onViewDetail,
  onEdit,
  onToggleActive,
}: Props) {
  const insets = useSafeAreaInsets();
  const [menuPhase, setMenuPhase] = useState<MenuPhase>("closed");

  const occupied = table.status === "OCCUPIED";
  const active = table.isActive;

  const closeMenu = () => setMenuPhase("closed");

  const openActionsMenu = () => setMenuPhase("actions");

  const runEdit = () => {
    closeMenu();
    onEdit(table);
  };

  const runActivate = () => {
    closeMenu();
    onToggleActive(table);
  };

  const runDeactivate = () => {
    closeMenu();
    onToggleActive(table);
  };

  const canDeactivate = active && !occupied;

  let primaryLabel = "Inactiva";
  let onPrimary: (() => void) | undefined;
  if (!active) {
    onPrimary = undefined;
  } else if (occupied) {
    primaryLabel = "Ver detalle";
    onPrimary = () => onViewDetail(table);
  } else {
    primaryLabel = "Abrir mesa";
    onPrimary = () => onOpenSession(table);
  }

  const sheetVisible = menuPhase !== "closed";

  return (
    <View style={[styles.card, cardShadowStyle(), { width }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Mesa {table.number}</Text>
        <Pressable
          hitSlop={10}
          onPress={openActionsMenu}
          style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Más acciones"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={mesasTheme.muted}
          />
        </Pressable>
      </View>

      <Text style={styles.meta}>Capacidad {table.capacity}</Text>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            !active && styles.dotInactive,
            active && occupied && styles.dotOccupied,
            active && !occupied && styles.dotFree,
          ]}
        />
        <Text style={styles.statusText}>
          {!active ? "Inactiva" : occupied ? "Ocupada" : "Libre"}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          !active && styles.primaryBtnDisabled,
          occupied && active && styles.primaryBtnOccupied,
          pressed && active && styles.primaryBtnPressed,
        ]}
        onPress={onPrimary}
        disabled={!active}
      >
        <Text
          style={[
            styles.primaryBtnText,
            occupied && active && styles.primaryBtnTextOnDark,
            !active && styles.primaryBtnTextMuted,
          ]}
        >
          {primaryLabel}
        </Text>
      </Pressable>

      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeMenu}
      >
        <View style={mesasModalStyles.backdrop}>
          <Pressable style={mesasModalStyles.dim} onPress={closeMenu} />
          <View
            style={[
              mesasModalStyles.sheet,
              styles.actionSheet,
              Platform.OS === "web" && styles.actionSheetWeb,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            {menuPhase === "actions" ? (
              <>
                <Text style={mesasModalStyles.sheetTitle}>
                  Mesa {table.number}
                </Text>
                <Text style={mesasModalStyles.sheetHint}>
                  {active && occupied
                    ? "Con sesión abierta solo podés editar datos. Cerrá la sesión para desactivar la mesa."
                    : "Elegí una acción"}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.menuRowPressed,
                  ]}
                  onPress={runEdit}
                >
                  <Text style={styles.menuRowText}>Editar datos</Text>
                </Pressable>

                {!active ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && styles.menuRowPressed,
                    ]}
                    onPress={runActivate}
                  >
                    <Text style={styles.menuRowText}>Activar mesa</Text>
                  </Pressable>
                ) : null}

                {canDeactivate ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && styles.menuRowPressed,
                    ]}
                    onPress={() => setMenuPhase("confirmDeactivate")}
                  >
                    <Text style={styles.menuRowTextDanger}>
                      Desactivar mesa
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={mesasModalStyles.ghostBtn}
                  onPress={closeMenu}
                >
                  <Text style={mesasModalStyles.ghostBtnText}>Cerrar</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={mesasModalStyles.sheetTitle}>
                  ¿Desactivar mesa {table.number}?
                </Text>
                <Text style={mesasModalStyles.sheetHint}>
                  Dejá de usarla en el salón hasta que la reactives.
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.destructiveBtn,
                    pressed && styles.menuRowPressed,
                  ]}
                  onPress={runDeactivate}
                >
                  <Text style={styles.destructiveBtnText}>Desactivar</Text>
                </Pressable>
                <Pressable
                  style={mesasModalStyles.ghostBtn}
                  onPress={() => setMenuPhase("actions")}
                >
                  <Text style={mesasModalStyles.ghostBtnText}>Volver</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: -0.2,
  },
  menuBtn: {
    padding: 4,
    marginRight: -4,
  },
  meta: {
    fontSize: 14,
    color: mesasTheme.muted,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFree: {
    backgroundColor: "#2e7d32",
  },
  dotOccupied: {
    backgroundColor: mesasTheme.occupied,
  },
  dotInactive: {
    backgroundColor: "#9e9e9e",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: welcomeTheme.textDark,
  },
  primaryBtn: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnOccupied: {
    backgroundColor: mesasTheme.occupied,
  },
  primaryBtnDisabled: {
    backgroundColor: mesasTheme.freeTint,
    borderWidth: 1,
    borderColor: mesasTheme.border,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtnTextOnDark: {
    color: "#fff",
  },
  primaryBtnTextMuted: {
    color: mesasTheme.muted,
  },
  actionSheet: {
    maxHeight: "70%",
  },
  actionSheetWeb: {
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  menuRow: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  menuRowPressed: { opacity: 0.85 },
  menuRowText: {
    fontSize: 16,
    fontWeight: "600",
    color: welcomeTheme.textDark,
  },
  menuRowTextDanger: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b00020",
  },
  destructiveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#b00020",
  },
  destructiveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
