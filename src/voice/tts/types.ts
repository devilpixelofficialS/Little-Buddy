export interface KokoroConfig {
  modelPath: string;
  voice: string;
  sampleRate: number;
  speed: number;
  pitch: number;
}

export interface SpeechOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
}

export type TTSState = "idle" | "loading" | "ready" | "speaking" | "error";

export interface TTSCallbacks {
  onStateChange?: (state: TTSState) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female" | "neutral";
}

export const DEFAULT_KOKORO_CONFIG: KokoroConfig = {
  modelPath: process.env.KOKORO_MODEL_PATH || "",
  voice: "af_heart",
  sampleRate: 24000,
  speed: 1.0,
  pitch: 1.0,
};

export const AVAILABLE_VOICES: Voice[] = [
  { id: "af_heart", name: "Heart", language: "en-US", gender: "female" },
  { id: "af_nicole", name: "Nicole", language: "en-US", gender: "female" },
  { id: "af_sarah", name: "Sarah", language: "en-US", gender: "female" },
  { id: "am_adam", name: "Adam", language: "en-US", gender: "male" },
  { id: "am_michael", name: "Michael", language: "en-US", gender: "male" },
];
