import {
  KokoroConfig,
  SpeechOptions,
  TTSState,
  TTSCallbacks,
  DEFAULT_KOKORO_CONFIG,
  AVAILABLE_VOICES,
  Voice,
} from "./types";

export class KokoroService {
  private config: KokoroConfig;
  private callbacks: TTSCallbacks;
  private state: TTSState = "idle";
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private abortController: AbortController | null = null;

  constructor(
    config: Partial<KokoroConfig> = {},
    callbacks: TTSCallbacks = {}
  ) {
    this.config = { ...DEFAULT_KOKORO_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  private setState(newState: TTSState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  async initialize(): Promise<void> {
    try {
      this.setState("loading");

      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
      });

      if (!this.config.modelPath) {
        console.warn(
          "Kokoro model path not set. Using simulation mode."
        );
      }

      this.setState("ready");
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    try {
      if (this.state === "speaking") {
        await this.stop();
      }

      this.setState("speaking");
      this.abortController = new AbortController();

      if (!this.config.modelPath) {
        await this.simulateSpeech(text);
        return;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: options.voice || this.config.voice,
          speed: options.speed || this.config.speed,
          pitch: options.pitch || this.config.pitch,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioData = await response.arrayBuffer();
      await this.playAudioBuffer(audioData);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        this.setState("error");
        this.callbacks.onError?.(error as Error);
      }
    }
  }

  private async playAudioBuffer(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized");
    }

    const audioBuffer = await this.audioContext.decodeAudioData(audioData);

    return new Promise((resolve, reject) => {
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext!.destination);

      this.currentSource = source;

      source.onended = () => {
        this.currentSource = null;
        this.setState("ready");
        this.callbacks.onComplete?.();
        resolve();
      };

      source.addEventListener("error", (event) => {
        this.currentSource = null;
        this.setState("error");
        reject(event);
      });

      source.start(0);
    });
  }

  private async simulateSpeech(text: string): Promise<void> {
    const words = text.split(" ");
    const duration = words.length * 0.2;

    for (let i = 0; i < words.length; i++) {
      if (this.abortController?.signal.aborted) {
        break;
      }

      const progress = (i + 1) / words.length;
      this.callbacks.onProgress?.(progress);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    this.setState("ready");
    this.callbacks.onComplete?.();
  }

  async stop(): Promise<void> {
    this.abortController?.abort();

    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }

    this.setState("ready");
  }

  getVoices(): Voice[] {
    return AVAILABLE_VOICES;
  }

  setVoice(voiceId: string): void {
    const voice = AVAILABLE_VOICES.find((v) => v.id === voiceId);
    if (voice) {
      this.config.voice = voiceId;
    }
  }

  getState(): TTSState {
    return this.state;
  }

  isSpeaking(): boolean {
    return this.state === "speaking";
  }

  destroy(): void {
    this.stop();
    this.audioContext?.close();
    this.callbacks = {};
  }
}
