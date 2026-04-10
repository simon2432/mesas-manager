import { useQuery } from "@tanstack/react-query";
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
import { fetchMenuItems } from "@/src/api/menu.api";
import { addSessionItem } from "@/src/api/tableSessions.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  addConsumptionSchema,
  type AddConsumptionFormInput,
  type AddConsumptionParsed,
} from "@/src/schemas/mesaSession.schema";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  visible: boolean;
  sessionId: number;
  onClose: () => void;
  onAdded: () => void;
};

export function AddConsumptionModal({
  visible,
  sessionId,
  onClose,
  onAdded,
}: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const menuQuery = useQuery({
    queryKey: ["menu", "items"],
    queryFn: fetchMenuItems,
    enabled: visible,
    staleTime: 60_000,
  });

  const activeItems = useMemo(() => {
    const list = menuQuery.data ?? [];
    return list.filter((i) => i.isActive);
  }, [menuQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeItems;
    return activeItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [activeItems, search]);

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<AddConsumptionFormInput, unknown, AddConsumptionParsed>({
    resolver: zodResolver(addConsumptionSchema),
    defaultValues: { menuItemId: 0, quantity: "1", note: "" },
  });

  const selectedId = watch("menuItemId");

  useEffect(() => {
    register("menuItemId");
  }, [register]);

  const close = () => {
    setSearch("");
    setSubmitError(null);
    reset({ menuItemId: 0, quantity: "1", note: "" });
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await addSessionItem(sessionId, {
        menuItemId: values.menuItemId,
        quantity: values.quantity,
        note: values.note,
      });
      onAdded();
      close();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo agregar el consumo."),
      );
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={mesasModalStyles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={mesasModalStyles.dim} onPress={close} />
        <View
          style={[
            mesasModalStyles.sheet,
            styles.sheetTall,
            Platform.OS === "web" && styles.sheetWeb,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Agregar consumo</Text>
          <Text style={mesasModalStyles.sheetHint}>
            Buscá un producto activo del menú, cantidad y nota opcional.
          </Text>

          <Text style={mesasModalStyles.label}>Buscar</Text>
          <TextInput
            style={mesasModalStyles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Nombre del producto…"
            placeholderTextColor={mesasTheme.muted}
            autoCorrect={false}
          />

          <Text style={mesasModalStyles.label}>Producto</Text>
          {menuQuery.isPending ? (
            <ActivityIndicator
              color={welcomeTheme.orange}
              style={{ marginBottom: 12 }}
            />
          ) : activeItems.length === 0 ? (
            <Text style={[mesasModalStyles.errorText, { marginBottom: 12 }]}>
              No hay productos activos en el menú. Cargalos en la pestaña Menú.
            </Text>
          ) : (
            <ScrollView
              style={styles.productList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {filtered.map((item) => {
                const sel = selectedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setValue("menuItemId", item.id, { shouldValidate: true })
                    }
                    style={[styles.productRow, sel && styles.productRowSelected]}
                  >
                    <View style={styles.productRowMain}>
                      <Text
                        style={[
                          styles.productName,
                          sel && styles.productNameSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatMoney(item.price)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Controller
            control={control}
            name="menuItemId"
            render={({ fieldState }) => (
              <>
                {fieldState.error?.message ? (
                  <Text style={mesasModalStyles.errorText}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            )}
          />

          <Text style={[mesasModalStyles.label, { marginTop: 10 }]}>
            Cantidad
          </Text>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <>
                <TextInput
                  style={mesasModalStyles.input}
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {fieldState.error?.message ? (
                  <Text style={mesasModalStyles.errorText}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            )}
          />

          <Text style={mesasModalStyles.label}>Nota (opcional)</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[mesasModalStyles.input, styles.noteInput]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                placeholder="Ej. sin sal, bien cocido…"
                placeholderTextColor={mesasTheme.muted}
                multiline
              />
            )}
          />

          {submitError ? (
            <Text style={mesasModalStyles.errorText}>{submitError}</Text>
          ) : null}

          <Pressable
            style={[
              mesasModalStyles.primaryBtn,
              (isSubmitting || activeItems.length === 0) &&
                mesasModalStyles.primaryBtnDisabled,
            ]}
            onPress={onSubmit}
            disabled={isSubmitting || activeItems.length === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={mesasModalStyles.primaryBtnText}>
                Agregar a la mesa
              </Text>
            )}
          </Pressable>

          <Pressable style={mesasModalStyles.ghostBtn} onPress={close}>
            <Text style={mesasModalStyles.ghostBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetTall: {
    maxHeight: "92%",
  },
  sheetWeb: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  productList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  productRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  productRowSelected: {
    backgroundColor: "rgba(245, 124, 0, 0.1)",
  },
  productRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: welcomeTheme.textDark,
  },
  productNameSelected: {
    color: welcomeTheme.orange,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
});
