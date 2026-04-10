import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
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
  deleteSessionItem,
  updateSessionItem,
  type SessionItemPublic,
} from "@/src/api/tableSessions.api";
import { welcomeTheme } from "@/src/constants/authTheme";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  editConsumptionSchema,
  type EditConsumptionFormInput,
  type EditConsumptionParsed,
} from "@/src/schemas/mesaSession.schema";
import { useConfirm } from "@/src/components/ui/ConfirmProvider";

type Props = {
  visible: boolean;
  sessionId: number;
  item: SessionItemPublic | null;
  onClose: () => void;
  onChanged: () => void;
};

export function EditItemModal({
  visible,
  sessionId,
  item,
  onClose,
  onChanged,
}: Props) {
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditConsumptionFormInput, unknown, EditConsumptionParsed>({
    resolver: zodResolver(editConsumptionSchema),
    defaultValues: { quantity: "1", note: "" },
  });

  useEffect(() => {
    if (item && visible) {
      reset({
        quantity: String(item.quantity),
        note: item.note ?? "",
      });
      setSubmitError(null);
    }
  }, [item, visible, reset]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!item) return;
    setSubmitError(null);
    try {
      await updateSessionItem(sessionId, item.id, {
        quantity: values.quantity,
        note: values.note,
      });
      onChanged();
      close();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo guardar el consumo."),
      );
    }
  });

  const confirmDelete = () => {
    if (!item) return;
    void (async () => {
      const ok = await confirm({
        title: "¿Eliminar esta línea?",
        message: item.productName,
        confirmLabel: "Eliminar",
        destructive: true,
      });
      if (!ok) return;
      try {
        await deleteSessionItem(sessionId, item.id);
        onChanged();
        close();
      } catch (e) {
        Alert.alert(
          "Error",
          getApiErrorMessage(e, "No se pudo eliminar."),
        );
      }
    })();
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
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
            Platform.OS === "web" && styles.sheetWeb,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Editar consumo</Text>
          <Text style={styles.productTitle}>{item.productName}</Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={mesasModalStyles.label}>Cantidad</Text>
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

            <Text style={mesasModalStyles.label}>Nota</Text>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[mesasModalStyles.input, styles.noteInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ej. sin cebolla, término medio, sin TACC…"
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

            <Pressable
              style={styles.deleteBtn}
              onPress={confirmDelete}
              disabled={isSubmitting}
            >
              <Text style={styles.deleteBtnText}>Eliminar línea</Text>
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
  sheetWeb: {
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    marginBottom: 16,
    lineHeight: 22,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  deleteBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c62828",
    backgroundColor: "#fff",
  },
  deleteBtnText: {
    color: "#c62828",
    fontSize: 15,
    fontWeight: "700",
  },
});
