import { Platform, type ModalProps } from "react-native";

/**
 * En iOS, un segundo `Modal` (p. ej. confirmación) queda detrás del primero
 * o roba mal el foco si no usa `overFullScreen`. Aplicar a todos los overlays.
 */
export const modalStackingProps: Partial<ModalProps> =
  Platform.OS === "ios" ? { presentationStyle: "overFullScreen" } : {};
