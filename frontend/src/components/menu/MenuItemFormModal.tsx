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
  createMenuItem,
  updateMenuItem,
  type PublicMenuItem,
} from "@/src/api/menu.api";
import { modalStackingProps } from "@/src/constants/modalPresentation";
import {
  mesasModalStyles,
  mesasTheme,
} from "@/src/constants/mesasTheme";
import {
  menuItemFormSchema,
  type MenuItemFormInput,
  type MenuItemFormParsed,
} from "@/src/schemas/adminCatalog.schema";

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  item: PublicMenuItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export function MenuItemFormModal({
  visible,
  mode,
  item,
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
  } = useForm<MenuItemFormInput, unknown, MenuItemFormParsed>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: { name: "", price: "", description: "" },
  });

  useEffect(() => {
    if (!visible) return;
    setSubmitError(null);
    if (mode === "create") {
      reset({ name: "", price: "", description: "" });
    } else if (item) {
      reset({
        name: item.name,
        price: String(item.price),
        description: item.description ?? "",
      });
    }
  }, [visible, mode, item, reset]);

  const close = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (mode === "create") {
        await createMenuItem({
          name: values.name,
          price: values.price,
          ...(values.description
            ? { description: values.description }
            : {}),
        });
      } else if (item) {
        await updateMenuItem(item.id, {
          name: values.name,
          price: values.price,
          description: values.description,
        });
      }
      onSaved();
      close();
    } catch (e) {
      setSubmitError(
        getApiErrorMessage(e, "No se pudo guardar el producto."),
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
              maxWidth: 480,
              alignSelf: "center",
              width: "100%",
            },
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>
            {mode === "create" ? "Nuevo producto" : "Editar producto"}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                    placeholder="Ej. Milanesa con fritas"
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

            <Text style={mesasModalStyles.label}>Precio</Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <>
                  <TextInput
                    style={mesasModalStyles.input}
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Ej. 8500 o 8500,50"
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

            <Text style={mesasModalStyles.label}>Descripción (opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    mesasModalStyles.input,
                    { minHeight: 80, textAlignVertical: "top" },
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Detalle del plato…"
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

            <Pressable style={mesasModalStyles.ghostBtn} onPress={close}>
              <Text style={mesasModalStyles.ghostBtnText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
