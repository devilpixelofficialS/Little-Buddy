import {
  WakeWordConfig,
  WakeWordDetection,
  WakeWordState,
  WakeWordCallbacks,
  DEFAULT_WAKEWORD_CONFIG,
} from "./types";

export class WakeWordService {
  private config: WakeWordConfig;
  private callbacks: WakeWordCallbacks;
  private state: WakeWordState = "idle";
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;

  constructor(
    config: Partial<WakeWordConfig> = {},
    callbacks: WakeWordCallbacks = {}
  ) {
    this.config = { ...DEFAULT_WAKEWORD_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  private setState(newState: WakeWordState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  async initialize(): Promise<void> {
    try {
      this.setState("loading");

      if (!this.config.modelPath) {
        console.warn(
          "Wake word model path not set. Using simulation mode."
        );
      }

      this.setState("idle");
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async startListening(): Promise<void> {
    try {
      if (this.state === "listening") {
        return;
      }

      this.setState("listening");

      this.audioContext = new AudioContext({
        sampleRate: this.config.audioSampleRate,
      });

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.audioSampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      try {
        await this.audioContext.audioWorklet.addModule(
          "/audio-processor.js"
        );
        this.workletNode = new AudioWorkletNode(
          this.audioContext,
          "audio-processor"
        );

        this.workletNode.port.onmessage = (event) => {
          const audioData = event.data as Float32Array;
          this.processAudioData(audioData);
        };

        source.connect(this.workletNode);
        this.workletNode.connect(this.audioContext.destination);
      } catch {
        console.warn(
          "AudioWorklet not supported, using ScriptProcessor fallback"
        );
        const processor = this.audioContext.createScriptProcessor(
          this.config.audioBufferSize,
          1,
          1
        );

        processor.onaudioprocess = (event) => {
          const audioData = event.inputBuffer.getChannelData(0);
          this.processAudioData(audioData);
        };

        source.connect(processor);
        processor.connect(this.audioContext.destination);
      }
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private processAudioData(audioData: Float32Array): void {
    if (this.state !== "listening") return;

    const energy = this.calculateEnergy(audioData);

    if (energy > this.config.sensitivity) {
      const detection: WakeWordDetection = {
        timestamp: new Date(),
        confidence: Math.min(energy / 2, 1),
        model: "default",
      };

      this.setState("detected");
      this.callbacks.onDetection?.(detection);

      setTimeout(() => {
        if (this.state === "detected") {
          this.setState("listening");
        }
      }, 1000);
    }
  }

  private calculateEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  async stopListening(): Promise<void> {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.setState("idle");
  }

  getState(): WakeWordState {
    return this.state;
  }

  destroy(): void {
    this.stopListening();
    this.callbacks = {};
  }
}
