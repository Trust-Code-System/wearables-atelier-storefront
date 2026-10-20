"use client";

import { useEffect, useState } from "react";
import { accountSession, type AccountSession } from "@/lib/account-api";

export function useAccountSession() {
  const [state, setState] = useState<{
    session: AccountSession | null;
    loading: boolean;
    error: string;
  }>({ session: null, loading: true, error: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const read = async () => {
      const current = ++revision;
      try {
        const session = await accountSession();
        if (active && revision === current)
          setState({ session, loading: false, error: "" });
      } catch {
        if (active && revision === current)
          setState({
            session: null,
            loading: false,
            error: "We couldn’t check your account. Please try again.",
          });
      }
    };
    const changed = () => {
      setState({ session: null, loading: true, error: "" });
      void read();
    };
    const visible = () => {
      if (document.visibilityState !== "hidden") void read();
    };
    void read();
    window.addEventListener("wearables:account-changed", changed);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      revision++;
      window.removeEventListener("wearables:account-changed", changed);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [retry]);
  return {
    ...state,
    refresh: () => {
      setState({ session: null, loading: true, error: "" });
      setRetry((value) => value + 1);
    },
  };
}
