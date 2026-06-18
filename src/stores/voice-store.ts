import { create } from "zustand";

export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

interface VoiceStore {
  state: VoiceState;
  setState: (state: VoiceState) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  response: string;
  setResponse: (response: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: "idle",
  setState: (state) => set({ state }),
  transcript: "",
  setTranscript: (transcript) => set({ transcript }),
  response: "",
  setResponse: (response) => set({ response }),
  isMuted: false,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  volume: 1,
  setVolume: (volume) => set({ volume }),
  error: null,
  setError: (error) => set({ error, state: "error" }),
  clearError: () => set({ error: null, state: "idle" }),
}));
