import { create } from "zustand";

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

function clampYmdToCap(ymd: string, cap: string): string {
  if (ymd > cap) return cap;
  return ymd;
}

type OperationalDayState = {
  serverTodayYmd: string | null;
  dateYmd: string;
  setDateYmd: (ymd: string) => void;
  shiftDay: (delta: number) => void;
  goToday: () => void;
  setServerTodayYmd: (ymd: string | null) => void;
};

function todayCap(get: () => OperationalDayState): string {
  return get().serverTodayYmd ?? deviceLocalYmd();
}

export function effectiveTodayYmd(): string {
  return useOperationalDayStore.getState().serverTodayYmd ?? deviceLocalYmd();
}

export const useOperationalDayStore = create<OperationalDayState>(
  (set, get) => ({
    serverTodayYmd: null,
    dateYmd: deviceLocalYmd(),
    setServerTodayYmd: (serverYmd) =>
      set((state) => {
        if (serverYmd === null) {
          return { serverTodayYmd: null };
        }
        const dateYmd = clampYmdToCap(state.dateYmd, serverYmd);
        return { serverTodayYmd: serverYmd, dateYmd };
      }),
    setDateYmd: (dateYmd) =>
      set({ dateYmd: clampYmdToCap(dateYmd, todayCap(get)) }),
    shiftDay: (delta) =>
      set({
        dateYmd: clampYmdToCap(shiftYmd(get().dateYmd, delta), todayCap(get)),
      }),
    goToday: () => set({ dateYmd: todayCap(get) }),
  }),
);
