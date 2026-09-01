import { create } from "zustand";

const STORAGE_KEY = "munnu-jam-code";

interface JamState {
  jamCode: string | null;
  setJamCode: (code: string | null) => void;
  // Called once on mount to pick up a code persisted from a previous visit.
  // Kept out of the store's initial state so server and first client render
  // match (both null) — reading localStorage there causes a hydration
  // mismatch since the server can't see it.
  hydrate: () => void;
}

export const useJamStore = create<JamState>((set) => ({
  jamCode: null,
  setJamCode: (code) => {
    try {
      if (code) localStorage.setItem(STORAGE_KEY, code);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — jam still works for this tab session.
    }
    set({ jamCode: code });
  },
  hydrate: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) set({ jamCode: stored });
    } catch {
      // localStorage unavailable — start without a jam.
    }
  },
}));
