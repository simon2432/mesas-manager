import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import {
  createWaiter,
  updateWaiter,
  type PublicWaiter,
} from "@/src/api/waiters.api";
import { modalStackingProps } from "@/src/constants/modalPresentation";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  waiterNameSchema,
  type WaiterNameInput,
  type WaiterNameParsed,
} from "@/src/schemas/adminCatalog.schema";

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  waiter: PublicWaiter | null;
  onClose: () => void;
  onSaved: () => void;
};

export function WaiterFormModal({
  visible,
  mode,
  waiter,
  onClose,
  onSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<WaiterNameInput, unknown, WaiterNameParsed>({
    resolver: zodResolver(waiterNameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!visible) return;
    setSubmitError(null);
    if (mode === "create") {
      reset({ name: "" });
    } else if (waiter) {
      reset({ name: waiter.name });
    }
  }, [visible, mode, waiter, reset]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (mode === "create") {
        await createWaiter({ name: values.name });
      } else if (waiter) {
        await updateWaiter(waiter.id, { name: values.name });
      }
      onSaved();
      close();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo guardar el mesero."),
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
        style={mesasModalStyles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={mesasModalStyles.dim} onPress={close} />
        <View
          style={[
            mesasModalStyles.sheet,
            Platform.OS === "web" && {
              maxWidth: 420,
              alignSelf: "center",
              width: "100%",
            },
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>
            {mode === "create" ? "Nuevo mesero" : "Editar mesero"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={mesasModalStyles.label}>Nombre</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <>
                  <TextInput
                    style={mesasModalStyles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Nombre completo o cómo lo conocen"
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
