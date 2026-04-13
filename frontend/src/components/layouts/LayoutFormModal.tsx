import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import {
  createLayout,
  setLayoutTables,
  updateLayout,
  type PublicLayout,
} from "@/src/api/layouts.api";
import type { PublicTable } from "@/src/types/tables.types";
import { welcomeTheme } from "@/src/constants/authTheme";
import { modalStackingProps } from "@/src/constants/modalPresentation";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";
import {
  layoutNameFormSchema,
  type LayoutNameFormInput,
  type LayoutNameFormParsed,
} from "@/src/schemas/layout.schema";

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  layout: PublicLayout | null;
  activeTables: PublicTable[];
  onClose: () => void;
  onSaved: () => void;
};

export function LayoutFormModal({
  visible,
  mode,
  layout,
  activeTables,
  onClose,
  onSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());

  const inactiveInLayout = useMemo(() => {
    if (!layout) return [];
    return layout.tables.filter((t) => !t.isActive);
  }, [layout]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LayoutNameFormInput, unknown, LayoutNameFormParsed>({
    resolver: zodResolver(layoutNameFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!visible) return;
    setSubmitError(null);
    if (mode === "create") {
      reset({ name: "" });
      setSelectedIds(new Set());
    } else if (layout) {
      reset({ name: layout.name });
      setSelectedIds(
        new Set(
          layout.tables.filter((t) => t.isActive).map((t) => t.id),
        ),
      );
    }
  }, [visible, mode, layout, reset]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const toggleTable = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const tableIds = [...selectedIds];
    try {
      if (mode === "create") {
        const created = await createLayout({ name: values.name });
        await setLayoutTables(created.id, { tableIds });
      } else if (layout) {
        await updateLayout(layout.id, { name: values.name });
        await setLayoutTables(layout.id, { tableIds });
      }
      onSaved();
      close();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo guardar el layout."),
      );
    }
  });

  return (
    <Modal
      {...modalStackingProps}
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={mesasModalStyles.backdrop}>
          <Pressable style={mesasModalStyles.dim} onPress={close} />
          <View
            style={[
              mesasModalStyles.sheet,
              styles.sheet,
              Platform.OS === "web" && styles.sheetWeb,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <Text style={mesasModalStyles.sheetTitle}>
              {mode === "create" ? "Nuevo layout" : "Editar layout"}
            </Text>
            <Text style={mesasModalStyles.sheetHint}>
              Elegí un nombre y las mesas activas que forman parte de esta
              configuración.
            </Text>

            <Text style={mesasModalStyles.label}>Nombre</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={mesasModalStyles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ej. Salón principal"
                  placeholderTextColor={mesasTheme.muted}
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              )}
            />

            {inactiveInLayout.length > 0 ? (
              <Text style={styles.warn}>
                Hay mesas inactivas en este layout (
                {inactiveInLayout.map((t) => t.number).join(", ")}). Al guardar
                solo se conservan las que marques abajo (activas).
              </Text>
            ) : null}

            <Text style={[mesasModalStyles.label, { marginTop: 6 }]}>
              Mesas incluidas
            </Text>
            <ScrollView
              style={styles.tableList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {activeTables.length === 0 ? (
                <Text style={styles.emptyTables}>
                  No hay mesas activas. Activá mesas en la pantalla Mesas.
                </Text>
              ) : (
                activeTables.map((t) => {
                  const on = selectedIds.has(t.id);
                  return (
                    <Pressable
                      key={t.id}
                      style={({ pressed }) => [
                        styles.tableRow,
                        pressed && styles.tableRowPressed,
                      ]}
                      onPress={() => toggleTable(t.id)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={on ? "checkbox" : "square-outline"}
                        size={22}
                        color={on ? welcomeTheme.orange : mesasTheme.muted}
                      />
                      <View style={styles.tableRowText}>
                        <Text style={styles.tableRowTitle}>Mesa {t.number}</Text>
                        <Text style={styles.tableRowSub}>
                          Capacidad {t.capacity}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {submitError ? (
              <Text style={mesasModalStyles.errorText}>{submitError}</Text>
            ) : null}

            <Pressable
              style={[
                mesasModalStyles.primaryBtn,
                isSubmitting && mesasModalStyles.primaryBtnDisabled,
              ]}
              onPress={() => void onSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={mesasModalStyles.primaryBtnText}>Guardar</Text>
              )}
            </Pressable>

            <Pressable style={mesasModalStyles.ghostBtn} onPress={close}>
              <Text style={mesasModalStyles.ghostBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "92%",
  },
  sheetWeb: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  warn: {
    fontSize: 13,
    color: "#b45309",
    lineHeight: 18,
    marginBottom: 10,
    marginTop: -4,
  },
  tableList: {
    maxHeight: 220,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    borderRadius: 10,
    backgroundColor: mesasTheme.surface,
  },
  emptyTables: {
    padding: 14,
    fontSize: 14,
    color: mesasTheme.muted,
    lineHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
    backgroundColor: "#fff",
  },
  tableRowPressed: { opacity: 0.9 },
  tableRowText: { flex: 1 },
  tableRowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  tableRowSub: {
    fontSize: 13,
    color: mesasTheme.muted,
    marginTop: 2,
  },
});
