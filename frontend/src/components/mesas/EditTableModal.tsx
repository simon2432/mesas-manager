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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/src/api/auth.api";
import { updateTable } from "@/src/api/tables.api";
import { modalStackingProps } from "@/src/constants/modalPresentation";
import { mesasModalStyles } from "@/src/constants/mesasTheme";
import {
  editTableFormSchemaWithMinCapacity,
  type EditTableFormValues,
  type EditTableParsed,
} from "@/src/schemas/mesas.schema";
import type { PublicTable } from "@/src/types/tables.types";

type Props = {
  visible: boolean;
  table: PublicTable | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditTableModal({ visible, table, onClose, onSaved }: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const minGuests = useMemo(() => {
    if (!table) return 1;
    if (
      table.status === "OCCUPIED" &&
      typeof table.openSessionGuestCount === "number"
    ) {
      return table.openSessionGuestCount;
    }
    return 1;
  }, [table]);

  const schema = useMemo(
    () => editTableFormSchemaWithMinCapacity(minGuests),
    [minGuests],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditTableFormValues, unknown, EditTableParsed>({
    resolver: zodResolver(schema),
    defaultValues: { number: "1", capacity: "4" },
  });

  useEffect(() => {
    if (table && visible) {
      reset({
        number: String(table.number),
        capacity: String(table.capacity),
      });
      setSubmitError(null);
    }
  }, [table, visible, reset, minGuests]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!table) return;
    setSubmitError(null);
    try {
      await updateTable(table.id, {
        number: values.number,
        capacity: values.capacity,
      });
      onSaved();
      onClose();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo guardar. Revisá los datos."),
      );
    }
  });

  if (!table) return null;

  return (
    <Modal
      {...modalStackingProps}
      key={`${table.id}-${minGuests}`}
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
            Editar mesa {table.number}
          </Text>
          <Text style={mesasModalStyles.sheetHint}>
            Cambiá número o capacidad. Si hay número duplicado, el servidor lo
            rechazará.
            {minGuests > 1
              ? ` Con la mesa ocupada, la capacidad no puede ser menor que ${minGuests} (comensales de la sesión).`
              : ""}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={mesasModalStyles.label}>Número</Text>
            <Controller
              control={control}
              name="number"
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

            <Text style={mesasModalStyles.label}>Capacidad</Text>
            <Controller
              control={control}
              name="capacity"
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

            {submitError ? (
              <Text style={mesasModalStyles.errorText}>{submitError}</Text>
            ) : null}

            <Pressable
              style={[
                mesasModalStyles.primaryBtn,
                isSubmitting && mesasModalStyles.primaryBtnDisabled,
              ]}
              onPress={onSubmit}
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
