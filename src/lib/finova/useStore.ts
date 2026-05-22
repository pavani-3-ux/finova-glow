import { useEffect, useState, useCallback } from "react";
import { store, auth, type Transaction, type Budget, type UserProfile } from "./store";

export function useFinovaData() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("finova:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("finova:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return {
    tick,
    refresh,
    transactions: store.getTransactions(),
    budgets: store.getBudgets(),
    profile: store.getProfile(),
    isAuthed: auth.isAuthed(),
  };
}

export type { Transaction, Budget, UserProfile };