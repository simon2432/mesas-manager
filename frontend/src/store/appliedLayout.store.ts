import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppliedLayoutEntry = {
  layoutId: number;
  layoutName: string;
  layoutTableIds: number[];
};

type AppliedLayoutState = {
  appliedLayouts: AppliedLayoutEntry[];
  setAppliedLayouts: (layouts: AppliedLayoutEntry[]) => void;
  clearApplied: () => void;
  removeAppliedLayout: (layoutId: number) => void;
};

export const useAppliedLayoutStore = create<AppliedLayoutState>()(
  persist(
    (set, get) => ({
      appliedLayouts: [],
      setAppliedLayouts: (appliedLayouts) => set({ appliedLayouts }),
      clearApplied: () => set({ appliedLayouts: [] }),
      removeAppliedLayout: (layoutId) =>
        set({
          appliedLayouts: get().appliedLayouts.filter(
            (e) => e.layoutId !== layoutId,
          ),
        }),
    }),
    {
      name: "mesas-applied-layouts",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ appliedLayouts: state.appliedLayouts }),
    },
  ),
);
