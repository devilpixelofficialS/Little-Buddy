export interface WakeWordConfig {
  modelPath: string;
  sensitivity: number;
  audioSampleRate: number;
  audioBufferSize: number;
}

export interface WakeWordDetection {
  timestamp: Date;
  confidence: number;
  model: string;
}

export type WakeWordState =
  | "idle"
  | "listening"
  | "detected"
  | "error"
  | "loading";

export interface WakeWordCallbacks {
  onDetection?: (detection: WakeWordDetection) => void;
  onStateChange?: (state: WakeWordState) => void;
  onError?: (error: Error) => void;
}

export const DEFAULT_WAKEWORD_CONFIG: WakeWordConfig = {
  modelPath: process.env.OPENWAKEWORD_MODEL_PATH || "",
  sensitivity: 0.5,
  audioSampleRate: 16000,
  audioBufferSize: 1280,
};
