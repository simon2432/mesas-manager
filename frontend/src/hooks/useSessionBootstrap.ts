import { useEffect } from "react";

import { getMeRequest } from "@/src/api/auth.api";
import { useAuthStore } from "@/src/store/auth.store";
import { useOperationalDayStore } from "@/src/store/operationalDay.store";

export function useSessionBootstrap(enabled: boolean): void {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!enabled || !token) return;

    let cancelled = false;
    void getMeRequest()
      .then((me) => {
        if (cancelled) return;
        setUser(me.user);
        useOperationalDayStore.getState().setServerTodayYmd(me.serverTodayYmd);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, token, setUser]);
}
