import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
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

import type { PublicWaiter } from "@/src/api/waiters.api";
import { getApiErrorMessage } from "@/src/api/auth.api";
import { openTableSession } from "@/src/api/tableSessions.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  openSessionFormSchemaForCapacity,
  type OpenSessionFormInput,
} from "@/src/schemas/mesas.schema";
import type { PublicTable } from "@/src/types/tables.types";

type Props = {
  visible: boolean;
  table: PublicTable | null;
  waiters: PublicWaiter[];
  waitersLoading: boolean;
  onClose: () => void;
  onOpened: (tableId: number) => void;
};

type ParsedOpenSession = {
  waiterId: number;
  guestCount: number;
};

export function OpenSessionModal({
  visible,
  table,
  waiters,
  waitersLoading,
  onClose,
  onOpened,
}: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const capacity = table?.capacity ?? 1;
  const schema = useMemo(
    () => openSessionFormSchemaForCapacity(capacity),
    [capacity],
  );

  const activeWaiters = useMemo(
    () => waiters.filter((w) => w.isActive),
    [waiters],
  );

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OpenSessionFormInput, unknown, ParsedOpenSession>({
    resolver: zodResolver(schema),
    defaultValues: { waiterId: 0, guestCount: "2" },
  });

  const { errors } = useFormState({ control });
  const waiterId = watch("waiterId");

  useEffect(() => {
    register("waiterId");
  }, [register]);

  useEffect(() => {
    if (visible && table) {
      const first = activeWaiters[0];
      reset({
        waiterId: first?.id ?? 0,
        guestCount: "2",
      });
      setSubmitError(null);
    }
  }, [visible, table, activeWaiters, reset]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!table) return;
    setSubmitError(null);
    try {
      await openTableSession({
        tableId: table.id,
        waiterId: values.waiterId,
        guestCount: values.guestCount,
      });
      onOpened(table.id);
      onClose();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo abrir la mesa. Intentá de nuevo."),
      );
    }
  });

  if (!table) {
    return null;
  }

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
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>
            Abrir mesa {table.number}
          </Text>
          <Text style={mesasModalStyles.sheetHint}>
            Capacidad máxima: {table.capacity} comensales. Elegí mesero y
            cantidad de personas.
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={mesasModalStyles.label}>Mesero</Text>
            {waitersLoading ? (
              <ActivityIndicator
                style={{ marginBottom: 16 }}
                color={welcomeTheme.orange}
              />
            ) : activeWaiters.length === 0 ? (
              <Text style={[mesasModalStyles.errorText, { marginBottom: 14 }]}>
                No hay meseros activos. Creá uno en Más → Meseros.
              </Text>
            ) : (
              <View style={styles.waiterChips}>
                {activeWaiters.map((w) => {
                  const selected = waiterId === w.id;
                  return (
                    <Pressable
                      key={w.id}
                      onPress={() =>
                        setValue("waiterId", w.id, { shouldValidate: true })
                      }
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {w.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {errors.waiterId?.message ? (
              <Text style={mesasModalStyles.errorText}>
                {String(errors.waiterId.message)}
              </Text>
            ) : null}

            <Text style={[mesasModalStyles.label, { marginTop: 8 }]}>
              Comensales
            </Text>
            <Controller
              control={control}
              name="guestCount"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <>
                  <TextInput
                    style={mesasModalStyles.input}
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={mesasTheme.muted}
                  />
                  {fieldState.error?.message ? (
                    <Text style={mesasModalStyles.errorText}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </>
              )}
            />

            {submitError ? (
              <Text style={mesasModalStyles.errorText}>{submitError}</Text>
            ) : null}

            <Pressable
              style={[
                mesasModalStyles.primaryBtn,
                (isSubmitting || activeWaiters.length === 0) &&
                  mesasModalStyles.primaryBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={isSubmitting || activeWaiters.length === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={mesasModalStyles.primaryBtnText}>
                  Confirmar apertura
                </Text>
              )}
            </Pressable>

            <Pressable style={mesasModalStyles.ghostBtn} onPress={close}>
              <Text style={mesasModalStyles.ghostBtnText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  waiterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: "#fafafa",
  },
  chipSelected: {
    borderColor: welcomeTheme.orange,
    backgroundColor: "rgba(245, 124, 0, 0.12)",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: mesasTheme.muted,
  },
  chipTextSelected: {
    color: welcomeTheme.orange,
  },
});
