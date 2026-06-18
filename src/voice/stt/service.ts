import {
  WhisperConfig,
  TranscriptionResult,
  WhisperState,
  WhisperCallbacks,
  DEFAULT_WHISPER_CONFIG,
} from "./types";

export class WhisperService {
  private config: WhisperConfig;
  private callbacks: WhisperCallbacks;
  private state: WhisperState = "idle";
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor(
    config: Partial<WhisperConfig> = {},
    callbacks: WhisperCallbacks = {}
  ) {
    this.config = { ...DEFAULT_WHISPER_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  private setState(newState: WhisperState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  async initialize(): Promise<void> {
    try {
      this.setState("loading");

      if (!this.config.modelPath) {
        console.warn(
          "Whisper model path not set. Using simulation mode."
        );
      }

      this.setState("ready");
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    try {
      if (this.state !== "ready") {
        throw new Error("Whisper service not ready");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processRecording();
      };

      this.mediaRecorder.start(100);
      this.setState("transcribing");
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
        this.mediaRecorder.onstop = async () => {
          await this.processRecording();
          resolve();
        };
        this.mediaRecorder.stop();
      } else {
        resolve();
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
    });
  }

  private async processRecording(): Promise<void> {
    try {
      if (this.audioChunks.length === 0) {
        this.setState("ready");
        return;
      }

      const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
      const result = await this.transcribe(audioBlob);

      this.callbacks.onResult?.(result);
      this.setState("ready");
    } catch (error) {
      this.setState("error");
      this.callbacks.onError?.(error as Error);
    }
  }

  async transcribe(audioBlob: Blob): Promise<TranscriptionResult> {
    const startTime = Date.now();

    if (!this.config.modelPath) {
      return this.simulateTranscription(audioBlob);
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", this.config.language);
      formData.append("response_format", "verbose_json");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();
      const duration = (Date.now() - startTime) / 1000;

      return {
        text: data.text,
        language: data.language || this.config.language,
        confidence: data.segments?.[0]?.avg_logprob
          ? Math.exp(data.segments[0].avg_logprob)
          : 0.9,
        segments:
          data.segments?.map(
            (s: {
              start: number;
              end: number;
              text: string;
              avg_logprob: number;
            }) => ({
              start: s.start,
              end: s.end,
              text: s.text,
              confidence: Math.exp(s.avg_logprob),
            })
          ) || [],
        duration,
      };
    } catch (error) {
      throw error;
    }
  }

  private async simulateTranscription(
    audioBlob: Blob
  ): Promise<TranscriptionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const duration = audioBlob.size / (this.config.sampleRate * 2);

    return {
      text: "[Simulated transcription - configure WHISPER_MODEL_PATH]",
      language: this.config.language,
      confidence: 0.95,
      segments: [
        {
          start: 0,
          end: duration,
          text: "[Simulated transcription]",
          confidence: 0.95,
        },
      ],
      duration,
    };
  }

  getState(): WhisperState {
    return this.state;
  }

  destroy(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.callbacks = {};
  }
}
