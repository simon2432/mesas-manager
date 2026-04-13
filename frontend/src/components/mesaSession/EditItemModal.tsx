import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
import { modalStackingProps } from "@/src/constants/modalPresentation";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";
import {
  editConsumptionSchema,
  type EditConsumptionFormInput,
  type EditConsumptionParsed,
} from "@/src/schemas/mesaSession.schema";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Confirmación in-modal: en iOS un segundo `Modal` (useConfirm) suele quedar invisible o bloquear toques. */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    if (!visible) {
      setDeleteConfirmOpen(false);
      setDeleting(false);
    }
  }, [item, visible, reset]);

  const close = () => {
    setSubmitError(null);
    setDeleteConfirmOpen(false);
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
      setSubmitError(getApiErrorMessage(e, "No se pudo guardar el consumo."));
    }
  });

  const openDeleteConfirm = () => {
    Keyboard.dismiss();
    setDeleteConfirmOpen(true);
  };

  const runDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await deleteSessionItem(sessionId, item.id);
      setDeleteConfirmOpen(false);
      onChanged();
      close();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, "No se pudo eliminar."));
    } finally {
      setDeleting(false);
    }
  };

  if (!item) return null;

  const onRequestModalClose = () => {
    if (deleteConfirmOpen) {
      setDeleteConfirmOpen(false);
      return;
    }
    close();
  };

  return (
    <Modal
      {...modalStackingProps}
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestModalClose}
    >
      <KeyboardAvoidingView
        style={mesasModalStyles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={mesasModalStyles.dim}
          onPress={() => {
            if (!deleteConfirmOpen) close();
          }}
        />
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
              disabled={isSubmitting || deleting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={mesasModalStyles.primaryBtnText}>Guardar</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.deleteBtn}
              onPress={openDeleteConfirm}
              disabled={isSubmitting || deleting}
            >
              <Text style={styles.deleteBtnText}>Eliminar línea</Text>
            </Pressable>

            <Pressable
              style={mesasModalStyles.ghostBtn}
              onPress={close}
              disabled={deleting}
            >
              <Text style={mesasModalStyles.ghostBtnText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>

        {deleteConfirmOpen ? (
          <View
            style={[
              styles.deleteOverlay,
              {
                paddingTop: Math.max(insets.top, 16),
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => !deleting && setDeleteConfirmOpen(false)}
              accessibilityLabel="Cerrar confirmación"
            />
            <View style={styles.deleteCard} accessibilityRole="alert">
              <Text style={styles.deleteCardTitle}>¿Eliminar esta línea?</Text>
              <Text style={styles.deleteCardMsg}>{item.productName}</Text>
              <View style={styles.deleteCardActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteCardBtnGhost,
                    pressed && styles.btnPressed,
                    deleting && styles.btnDisabled,
                  ]}
                  onPress={() => !deleting && setDeleteConfirmOpen(false)}
                  disabled={deleting}
                >
                  <Text style={styles.deleteCardBtnGhostText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteCardBtnDanger,
                    pressed && styles.btnPressed,
                    deleting && styles.btnDisabled,
                  ]}
                  onPress={() => void runDelete()}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteCardBtnDangerText}>Eliminar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
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
  deleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(15, 18, 24, 0.55)",
    zIndex: 100,
  },
  deleteCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    zIndex: 2,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  deleteCardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  deleteCardMsg: {
    fontSize: 15,
    lineHeight: 22,
    color: mesasTheme.muted,
    marginBottom: 22,
  },
  deleteCardActions: {
    gap: 10,
  },
  deleteCardBtnGhost: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: mesasTheme.surface,
    borderWidth: 1,
    borderColor: mesasTheme.border,
  },
  deleteCardBtnGhostText: {
    fontSize: 15,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  deleteCardBtnDanger: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#b00020",
    minHeight: 48,
    justifyContent: "center",
  },
  deleteCardBtnDangerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  btnPressed: { opacity: 0.88 },
  btnDisabled: { opacity: 0.55 },
});
