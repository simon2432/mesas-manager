import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasModalStyles, mesasTheme } from "@/src/constants/mesasTheme";
import { deviceLocalYmd } from "@/src/store/operationalDay.store";

import { WebDateInput } from "./WebDateInput";

function ymdToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

type Props = {
  visible: boolean;
  valueYmd: string;
  onClose: () => void;
  onConfirm: (ymd: string) => void;
};

const MIN_DATE = new Date(2020, 0, 1);
const MAX_DATE = new Date(2100, 11, 31);

export function CalendarPickModal({
  visible,
  valueYmd,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draftYmd, setDraftYmd] = useState(valueYmd);

  useEffect(() => {
    if (visible) setDraftYmd(valueYmd);
  }, [visible, valueYmd]);

  const apply = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draftYmd)) return;
    onConfirm(draftYmd);
    onClose();
  };

  const onNativeChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setDraftYmd(deviceLocalYmd(date));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={mesasModalStyles.backdrop}>
        <Pressable style={mesasModalStyles.dim} onPress={onClose} />
        <View
          style={[
            mesasModalStyles.sheet,
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>Elegir fecha</Text>
          <Text style={mesasModalStyles.sheetHint}>
            Se usa el mismo día que enviás al servidor (YYYY-MM-DD).
          </Text>

          {Platform.OS === "web" ? (
            <WebDateInput value={draftYmd} onChange={setDraftYmd} />
          ) : (
            <DateTimePicker
              value={ymdToLocalDate(draftYmd)}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={onNativeChange}
              minimumDate={MIN_DATE}
              maximumDate={MAX_DATE}
              locale="es-AR"
              themeVariant="light"
            />
          )}

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.secondaryBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={apply}
            >
              <Text style={styles.primaryBtnText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "90%",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mesasTheme.border,
    backgroundColor: "#fff",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: mesasTheme.muted,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: welcomeTheme.orange,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  pressed: { opacity: 0.88 },
});
