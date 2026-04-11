import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
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
import {
  deviceLocalYmd,
  effectiveTodayYmd,
} from "@/src/store/operationalDay.store";

import { WebDateInput } from "./WebDateInput";

function ymdToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function clampYmd(ymd: string, lo: string, hi: string): string {
  if (ymd < lo) return lo;
  if (ymd > hi) return hi;
  return ymd;
}

type Props = {
  visible: boolean;
  valueYmd: string;
  onClose: () => void;
  onConfirm: (ymd: string) => void;
  title?: string;
  minYmd?: string;
  maxYmd?: string;
};

const ABS_MIN_YMD = "2020-01-01";

function todayNoon(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

export function CalendarPickModal({
  visible,
  valueYmd,
  onClose,
  onConfirm,
  title = "Elegir fecha",
  minYmd,
  maxYmd,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draftYmd, setDraftYmd] = useState(valueYmd);

  const today = effectiveTodayYmd();
  const hi = maxYmd ?? today;
  const lo = useMemo(() => {
    const raw = minYmd ?? ABS_MIN_YMD;
    return raw > hi ? hi : raw;
  }, [minYmd, hi]);

  const safeLo = lo <= hi ? lo : hi;
  const safeHi = lo <= hi ? hi : lo;

  const minimumDate = ymdToLocalDate(safeLo);
  const maxPickerDate = useMemo(() => {
    const d = ymdToLocalDate(safeHi);
    const t = todayNoon();
    return d.getTime() > t.getTime() ? t : d;
  }, [safeHi]);

  useEffect(() => {
    if (!visible) return;
    const clamped = clampYmd(valueYmd, safeLo, safeHi);
    setDraftYmd(clamped);
  }, [visible, valueYmd, safeLo, safeHi]);

  const apply = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draftYmd)) return;
    const ymd = clampYmd(draftYmd, safeLo, safeHi);
    onConfirm(ymd);
    onClose();
  };

  const onNativeChange = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    const picked = deviceLocalYmd(date);
    setDraftYmd(clampYmd(picked, safeLo, safeHi));
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
            styles.sheetWidth,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <Text style={mesasModalStyles.sheetTitle}>{title}</Text>
          <Text style={mesasModalStyles.sheetHint}>
            Calendario local (YYYY-MM-DD). El servidor interpreta el día en su
            zona horaria.
          </Text>

          {Platform.OS === "web" ? (
            <WebDateInput
              value={draftYmd}
              onChange={(ymd) => setDraftYmd(clampYmd(ymd, safeLo, safeHi))}
              minYmd={safeLo}
              maxYmd={safeHi}
            />
          ) : (
            <DateTimePicker
              value={ymdToLocalDate(draftYmd)}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={onNativeChange}
              minimumDate={minimumDate}
              maximumDate={maxPickerDate}
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
  sheetWidth: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
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
