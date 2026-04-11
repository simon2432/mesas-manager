import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";
import {
  effectiveTodayYmd,
  useOperationalDayStore,
} from "@/src/store/operationalDay.store";

import { CalendarPickModal } from "./CalendarPickModal";

function formatYmdLabel(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  try {
    return dt.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

export function OperationalDayBar() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateYmd = useOperationalDayStore((s) => s.dateYmd);
  const setDateYmd = useOperationalDayStore((s) => s.setDateYmd);
  const shiftDay = useOperationalDayStore((s) => s.shiftDay);
  const goToday = useOperationalDayStore((s) => s.goToday);

  const todayYmd = effectiveTodayYmd();
  const isDeviceToday = dateYmd === todayYmd;
  const isLatestDay = dateYmd >= todayYmd;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        onPress={() => shiftDay(-1)}
        accessibilityLabel="Día anterior"
      >
        <Ionicons name="chevron-back" size={22} color={welcomeTheme.orange} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.center, pressed && styles.pressed]}
        onPress={() => setCalendarOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir calendario para elegir fecha"
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={welcomeTheme.orange}
          style={styles.calIcon}
        />
        <Text style={styles.dateMain}>{formatYmdLabel(dateYmd)}</Text>
        <Text style={styles.dateSub}>{dateYmd}</Text>
        <Text style={styles.calHint}>Calendario</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.iconBtn,
          pressed && !isLatestDay && styles.pressed,
          isLatestDay && styles.iconBtnDisabled,
        ]}
        onPress={() => {
          if (!isLatestDay) shiftDay(1);
        }}
        disabled={isLatestDay}
        accessibilityLabel="Día siguiente"
        accessibilityState={{ disabled: isLatestDay }}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={isLatestDay ? mesasTheme.muted : welcomeTheme.orange}
        />
      </Pressable>

      {!isDeviceToday ? (
        <Pressable
          style={({ pressed }) => [styles.todayBtn, pressed && styles.pressed]}
          onPress={goToday}
        >
          <Text style={styles.todayBtnText}>Hoy</Text>
        </Pressable>
      ) : null}

      <CalendarPickModal
        visible={calendarOpen}
        valueYmd={dateYmd}
        onClose={() => setCalendarOpen(false)}
        onConfirm={(ymd) => {
          setDateYmd(ymd);
          setCalendarOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  iconBtnDisabled: {
    opacity: 0.45,
  },
  pressed: { opacity: 0.75 },
  center: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  calIcon: {
    marginBottom: 2,
  },
  calHint: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: welcomeTheme.orange,
    letterSpacing: 0.3,
  },
  dateMain: {
    fontSize: 15,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    textTransform: "capitalize",
    textAlign: "center",
  },
  dateSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: mesasTheme.muted,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(245, 124, 0, 0.12)",
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
});
