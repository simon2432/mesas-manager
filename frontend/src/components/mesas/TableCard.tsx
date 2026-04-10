import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";
import { cardShadowStyle, mesasTheme } from "@/src/constants/mesasTheme";
import type { PublicTable } from "@/src/types/tables.types";

type Props = {
  table: PublicTable;
  width: number;
  onOpenSession: (t: PublicTable) => void;
  onViewDetail: (t: PublicTable) => void;
  onEdit: (t: PublicTable) => void;
  onToggleActive: (t: PublicTable) => void;
};

export function TableCard({
  table,
  width,
  onOpenSession,
  onViewDetail,
  onEdit,
  onToggleActive,
}: Props) {
  const occupied = table.status === "OCCUPIED";
  const active = table.isActive;

  const confirmDeactivate = () => {
    Alert.alert(
      "¿Desactivar esta mesa?",
      "Dejá de usarla en el salón hasta que la reactives.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => onToggleActive(table),
        },
      ],
    );
  };

  const openActionsMenu = () => {
    if (!active) {
      Alert.alert(`Mesa ${table.number}`, undefined, [
        {
          text: "Activar mesa",
          onPress: () => onToggleActive(table),
        },
        { text: "Cancelar", style: "cancel" },
      ]);
      return;
    }

    const opts: {
      text: string;
      style?: "destructive" | "cancel";
      onPress?: () => void;
    }[] = [{ text: "Editar datos", onPress: () => onEdit(table) }];

    if (table.status === "FREE") {
      opts.push({
        text: "Desactivar mesa",
        style: "destructive",
        onPress: confirmDeactivate,
      });
    }

    opts.push({ text: "Cancelar", style: "cancel" });
    Alert.alert(`Mesa ${table.number}`, "Elegí una acción", opts);
  };

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
});
