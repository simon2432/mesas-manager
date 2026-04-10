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

type OperationalDayState = {
  dateYmd: string;
  setDateYmd: (ymd: string) => void;
  shiftDay: (delta: number) => void;
  goToday: () => void;
};

export const useOperationalDayStore = create<OperationalDayState>((set, get) => ({
  dateYmd: deviceLocalYmd(),
  setDateYmd: (dateYmd) => set({ dateYmd }),
  shiftDay: (delta) => set({ dateYmd: shiftYmd(get().dateYmd, delta) }),
  goToday: () => set({ dateYmd: deviceLocalYmd() }),
}));
