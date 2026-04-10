import { useEffect } from "react";

import { getMeRequest } from "@/src/api/auth.api";
import { useAuthStore } from "@/src/store/auth.store";

export function useSessionBootstrap(enabled: boolean): void {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!enabled || !token) return;

    let cancelled = false;
    void getMeRequest()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        /* 401 → logout vía interceptor */
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, token, setUser]);
}
