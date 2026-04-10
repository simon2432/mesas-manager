import { Ionicons } from "@expo/vector-icons";
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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getApiErrorMessage,
  loginRequest,
  type AuthSuccessResponse,
} from "@/src/api/auth.api";
import { authColors } from "@/src/constants/authTheme";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/src/schemas/auth.schema";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: AuthSuccessResponse) => void;
};

export function LoginModal({ visible, onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const close = () => {
    setSubmitError(null);
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const res = await loginRequest(values.email, values.password);
      reset();
      onSuccess(res);
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo iniciar sesión. Revisá tus datos."),
      );
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.dim} onPress={close} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Iniciar sesión</Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityLabel="Cerrar">
              <Ionicons name="close" size={26} color={authColors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={authColors.textMuted}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {error?.message ? (
                    <Text style={styles.fieldError}>{error.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={authColors.textMuted}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {error?.message ? (
                    <Text style={styles.fieldError}>{error.message}</Text>
                  ) : null}
                </View>
              )}
            />

            {submitError ? (
              <Text style={styles.submitError}>{submitError}</Text>
            ) : null}

            <Pressable
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              onPress={() => void onSubmit()}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={authColors.bg} />
              ) : (
                <Text style={styles.primaryBtnText}>Entrar</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: authColors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: authColors.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: authColors.text,
    letterSpacing: 0.3,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: authColors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: authColors.surface2,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: authColors.text,
  },
  fieldError: {
    color: authColors.error,
    fontSize: 12,
    marginTop: 6,
  },
  submitError: {
    color: authColors.error,
    fontSize: 14,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: authColors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: authColors.bg,
  },
});
