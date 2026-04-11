import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthUser } from "@/src/types/user.types";
import { useOperationalDayStore } from "@/src/store/operationalDay.store";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (payload: { token: string; user: AuthUser }) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => {
        useOperationalDayStore.getState().setServerTodayYmd(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: "mesas-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
