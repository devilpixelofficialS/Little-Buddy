import { WakeWordService } from "./wakeword/service";
import { WhisperService } from "./stt/service";
import { KokoroService } from "./tts/service";
import {
  WakeWordConfig,
  DEFAULT_WAKEWORD_CONFIG,
} from "./wakeword/types";
import { WhisperConfig, DEFAULT_WHISPER_CONFIG } from "./stt/types";
import { KokoroConfig, SpeechOptions, DEFAULT_KOKORO_CONFIG } from "./tts/types";

export type VoiceOrchestratorState =
  | "idle"
  | "wake-word-listening"
  | "recording"
  | "processing"
  | "speaking"
  | "error";

export interface VoiceOrchestratorConfig {
  wakeWord: Partial<WakeWordConfig>;
  stt: Partial<WhisperConfig>;
  tts: Partial<KokoroConfig>;
}

export interface VoiceOrchestratorCallbacks {
  onStateChange?: (state: VoiceOrchestratorState) => void;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onWakeWord?: () => void;
}

export const DEFAULT_ORCHESTRATOR_CONFIG: VoiceOrchestratorConfig = {
  wakeWord: DEFAULT_WAKEWORD_CONFIG,
  stt: DEFAULT_WHISPER_CONFIG,
  tts: DEFAULT_KOKORO_CONFIG,
};

export class VoiceOrchestrator {
  private wakeWord: WakeWordService;
  private stt: WhisperService;
  private tts: KokoroService;
  private callbacks: VoiceOrchestratorCallbacks;
  private state: VoiceOrchestratorState = "idle";
  private isInitialized = false;

  constructor(
    config: Partial<VoiceOrchestratorConfig> = {},
    callbacks: VoiceOrchestratorCallbacks = {}
  ) {
    const fullConfig = {
      ...DEFAULT_ORCHESTRATOR_CONFIG,
      ...config,
    };

    this.callbacks = callbacks;

    this.wakeWord = new WakeWordService(fullConfig.wakeWord, {
      onDetection: () => this.handleWakeWordDetection(),
      onStateChange: () => {},
      onError: (error) => this.handleError(error),
    });

    this.stt = new WhisperService(fullConfig.stt, {
      onResult: (result: { text: string }) => this.handleTranscriptionResult(result.text),
      onError: (error: Error) => this.handleError(error),
    });

    this.tts = new KokoroService(fullConfig.tts, {
      onStateChange: (state: string) => {
        if (state === "ready" && this.state === "speaking") {
          this.setState("wake-word-listening");
          this.wakeWord.startListening();
        }
      },
      onComplete: () => {
        this.setState("wake-word-listening");
        this.wakeWord.startListening();
      },
      onError: (error: Error) => this.handleError(error),
    });
  }

  private setState(newState: VoiceOrchestratorState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  private handleError(error: Error): void {
    this.setState("error");
    this.callbacks.onError?.(error);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.wakeWord.initialize(),
        this.stt.initialize(),
        this.tts.initialize(),
      ]);

      this.isInitialized = true;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.setState("wake-word-listening");
    await this.wakeWord.startListening();
  }

  async stop(): Promise<void> {
    await Promise.all([
      this.wakeWord.stopListening(),
      this.stt.stopRecording(),
      this.tts.stop(),
    ]);

    this.setState("idle");
  }

  private async handleWakeWordDetection(): Promise<void> {
    this.callbacks.onWakeWord?.();

    try {
      await this.wakeWord.stopListening();
      this.setState("recording");
      await this.stt.startRecording();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleTranscriptionResult(transcript: string): Promise<void> {
    this.callbacks.onTranscript?.(transcript);

    try {
      this.setState("processing");
      await this.stt.stopRecording();

      const response = await this.processTranscript(transcript);
      this.callbacks.onResponse?.(response);

      this.setState("speaking");
      await this.tts.speak(response);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async processTranscript(transcript: string): Promise<string> {
    return `I heard you say: "${transcript}". This is a placeholder response. Implement agent processing to generate real responses.`;
  }

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    this.setState("speaking");
    await this.tts.speak(text, options);
  }

  async interrupt(): Promise<void> {
    await this.tts.stop();
    await this.stt.stopRecording();

    this.setState("wake-word-listening");
    await this.wakeWord.startListening();
  }

  getState(): VoiceOrchestratorState {
    return this.state;
  }

  destroy(): void {
    this.wakeWord.destroy();
    this.stt.destroy();
    this.tts.destroy();
    this.callbacks = {};
  }
}
