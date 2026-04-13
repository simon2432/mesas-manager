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
import { modalStackingProps } from "@/src/constants/modalPresentation";
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

const COMPACT_CARD_MAX_WIDTH = 128;

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
  const compact = width <= COMPACT_CARD_MAX_WIDTH;

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
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        cardShadowStyle(),
        { width },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>
          Mesa {table.number}
        </Text>
        <Pressable
          hitSlop={10}
          onPress={openActionsMenu}
          style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Más acciones"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={compact ? 17 : 20}
            color={mesasTheme.muted}
          />
        </Pressable>
      </View>

      <Text style={[styles.meta, compact && styles.metaCompact]}>
        Cap. {table.capacity}
      </Text>

      <View style={[styles.statusRow, compact && styles.statusRowCompact]}>
        <View
          style={[
            styles.dot,
            compact && styles.dotCompact,
            !active && styles.dotInactive,
            active && occupied && styles.dotOccupied,
            active && !occupied && styles.dotFree,
          ]}
        />
        <Text style={[styles.statusText, compact && styles.statusTextCompact]}>
          {!active ? "Inactiva" : occupied ? "Ocupada" : "Libre"}
        </Text>
      </View>

      {active && occupied && table.activeWaiterName ? (
        <Text
          style={[styles.waiterName, compact && styles.waiterNameCompact]}
          numberOfLines={1}
        >
          Mozo: {table.activeWaiterName}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          compact && styles.primaryBtnCompact,
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
            compact && styles.primaryBtnTextCompact,
            occupied && active && styles.primaryBtnTextOnDark,
            !active && styles.primaryBtnTextMuted,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={compact}
          minimumFontScale={compact ? 0.82 : 1}
        >
          {primaryLabel}
        </Text>
      </Pressable>

      <Modal
        {...modalStackingProps}
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
  cardCompact: {
    padding: 9,
    borderRadius: 10,
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
    flex: 1,
    minWidth: 0,
  },
  cardTitleCompact: {
    fontSize: 14,
    letterSpacing: -0.15,
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
  metaCompact: {
    fontSize: 11,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  statusRowCompact: {
    gap: 5,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    flex: 1,
    minWidth: 0,
  },
  statusTextCompact: {
    fontSize: 11,
  },
  waiterName: {
    fontSize: 13,
    fontWeight: "700",
    color: mesasTheme.occupied,
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 17,
  },
  waiterNameCompact: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 14,
  },
  primaryBtn: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnCompact: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 7,
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
    textAlign: "center",
  },
  primaryBtnTextCompact: {
    fontSize: 12,
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
