import { create } from "zustand";

export type AppStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "executing"
  | "speaking"
  | "error";

interface AppState {
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
  isInitialized: false,
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  error: null,
  setError: (error) => set({ error, status: "error" }),
  clearError: () => set({ error: null, status: "idle" }),
}));
