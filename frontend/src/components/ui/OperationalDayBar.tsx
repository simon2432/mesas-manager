import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

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

const COMPACT_BAR_BREAKPOINT = 440;

export function OperationalDayBar() {
  const { width } = useWindowDimensions();
  const compact = width < COMPACT_BAR_BREAKPOINT;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateYmd = useOperationalDayStore((s) => s.dateYmd);
  const setDateYmd = useOperationalDayStore((s) => s.setDateYmd);
  const shiftDay = useOperationalDayStore((s) => s.shiftDay);
  const goToday = useOperationalDayStore((s) => s.goToday);

  const todayYmd = effectiveTodayYmd();
  const isDeviceToday = dateYmd === todayYmd;
  const isLatestDay = dateYmd >= todayYmd;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        style={({ pressed }) => [
          styles.iconBtn,
          compact && styles.iconBtnCompact,
          pressed && styles.pressed,
        ]}
        onPress={() => shiftDay(-1)}
        accessibilityLabel="Día anterior"
      >
        <Ionicons
          name="chevron-back"
          size={compact ? 20 : 22}
          color={welcomeTheme.orange}
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.center,
          compact && styles.centerCompact,
          pressed && styles.pressed,
        ]}
        onPress={() => setCalendarOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir calendario para elegir fecha"
      >
        <Ionicons
          name="calendar-outline"
          size={compact ? 18 : 20}
          color={welcomeTheme.orange}
          style={styles.calIcon}
        />
        <Text
          style={[styles.dateMain, compact && styles.dateMainCompact]}
          numberOfLines={2}
        >
          {formatYmdLabel(dateYmd)}
        </Text>
        <Text style={[styles.dateSub, compact && styles.dateSubCompact]}>
          {dateYmd}
        </Text>
        {!compact ? <Text style={styles.calHint}>Calendario</Text> : null}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.iconBtn,
          compact && styles.iconBtnCompact,
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
          size={compact ? 20 : 22}
          color={isLatestDay ? mesasTheme.muted : welcomeTheme.orange}
        />
      </Pressable>

      {!isDeviceToday ? (
        <Pressable
          style={({ pressed }) => [
            styles.todayBtn,
            compact && styles.todayBtnCompact,
            pressed && styles.pressed,
          ]}
          onPress={goToday}
        >
          <Text
            style={[styles.todayBtnText, compact && styles.todayBtnTextCompact]}
          >
            Hoy
          </Text>
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
  wrapCompact: {
    gap: 2,
    marginBottom: 10,
    paddingVertical: 2,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  iconBtnCompact: {
    padding: 6,
    borderRadius: 8,
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
  centerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 10,
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
  dateMainCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  dateSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: mesasTheme.muted,
  },
  dateSubCompact: {
    fontSize: 11,
    marginTop: 1,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(245, 124, 0, 0.12)",
  },
  todayBtnCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: welcomeTheme.orange,
  },
  todayBtnTextCompact: {
    fontSize: 12,
  },
});
