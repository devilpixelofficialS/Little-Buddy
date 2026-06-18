export interface WhisperConfig {
  modelPath: string;
  language: string;
  sampleRate: number;
  maxLength: number;
  temperature: number;
  beamSize: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  segments: TranscriptionSegment[];
  duration: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export type WhisperState =
  | "idle"
  | "loading"
  | "ready"
  | "transcribing"
  | "error";

export interface WhisperCallbacks {
  onResult?: (result: TranscriptionResult) => void;
  onPartialResult?: (text: string) => void;
  onStateChange?: (state: WhisperState) => void;
  onError?: (error: Error) => void;
}

export const DEFAULT_WHISPER_CONFIG: WhisperConfig = {
  modelPath: process.env.WHISPER_MODEL_PATH || "",
  language: "en",
  sampleRate: 16000,
  maxLength: 30,
  temperature: 0.0,
  beamSize: 5,
};
