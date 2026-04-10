import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { createTable } from "@/src/api/tables.api";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  createTableFormSchema,
  type CreateTableFormValues,
  type CreateTableParsed,
} from "@/src/schemas/mesas.schema";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateTableModal({ visible, onClose, onCreated }: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateTableFormValues, unknown, CreateTableParsed>({
    resolver: zodResolver(createTableFormSchema),
    defaultValues: { number: "1", capacity: "4" },
  });

  const close = () => {
    setSubmitError(null);
    reset({ number: "1", capacity: "4" });
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createTable({
        number: values.number,
        capacity: values.capacity,
      });
      reset({ number: "1", capacity: "4" });
      onCreated();
      onClose();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo crear la mesa. Revisá los datos."),
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
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Nueva mesa</Text>
          <Text style={mesasModalStyles.sheetHint}>
            Número visible en el salón y cantidad máxima de comensales.
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
                    placeholder="Ej. 12"
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
                    placeholder="Ej. 4"
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
                isSubmitting && mesasModalStyles.primaryBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={mesasModalStyles.primaryBtnText}>Crear mesa</Text>
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
