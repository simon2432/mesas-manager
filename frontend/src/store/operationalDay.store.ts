import { create } from "zustand";

/** YYYY-MM-DD en calendario local del dispositivo (coincide con lo que enviamos al servidor). */
export function deviceLocalYmd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(y, m - 1, d + deltaDays);
  return deviceLocalYmd(t);
}

function clampYmdToToday(ymd: string): string {
  const t = deviceLocalYmd();
  return ymd > t ? t : ymd;
}

type OperationalDayState = {
  dateYmd: string;
  setDateYmd: (ymd: string) => void;
  shiftDay: (delta: number) => void;
  goToday: () => void;
};

export const useOperationalDayStore = create<OperationalDayState>(
  (set, get) => ({
    dateYmd: deviceLocalYmd(),
    setDateYmd: (dateYmd) => set({ dateYmd: clampYmdToToday(dateYmd) }),
    shiftDay: (delta) =>
      set({ dateYmd: clampYmdToToday(shiftYmd(get().dateYmd, delta)) }),
    goToday: () => set({ dateYmd: deviceLocalYmd() }),
  }),
);
