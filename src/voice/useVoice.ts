"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VoiceOrchestrator,
  VoiceOrchestratorState,
  VoiceOrchestratorConfig,
  DEFAULT_ORCHESTRATOR_CONFIG,
} from "./orchestrator";

interface UseVoiceOptions {
  config?: Partial<VoiceOrchestratorConfig>;
  autoStart?: boolean;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

interface UseVoiceReturn {
  state: VoiceOrchestratorState;
  isIdle: boolean;
  isListening: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isError: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  error: Error | null;
  lastTranscript: string | null;
  lastResponse: string | null;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { config, autoStart = false, onTranscript, onResponse } = options;

  const [state, setState] = useState<VoiceOrchestratorState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const orchestratorRef = useRef<VoiceOrchestrator | null>(null);

  useEffect(() => {
    const orchestrator = new VoiceOrchestrator(
      config ?? DEFAULT_ORCHESTRATOR_CONFIG,
      {
        onStateChange: setState,
        onTranscript: (text) => {
          setLastTranscript(text);
          onTranscript?.(text);
        },
        onResponse: (text) => {
          setLastResponse(text);
          onResponse?.(text);
        },
        onError: setError,
      }
    );

    orchestratorRef.current = orchestrator;

    orchestrator.initialize().then(() => {
      if (autoStart) {
        orchestrator.start();
      }
    });

    return () => {
      orchestrator.destroy();
    };
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      await orchestratorRef.current?.start();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await orchestratorRef.current?.stop();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setError(null);
      await orchestratorRef.current?.speak(text);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const interrupt = useCallback(async () => {
    try {
      await orchestratorRef.current?.interrupt();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  return {
    state,
    isIdle: state === "idle",
    isListening: state === "wake-word-listening",
    isRecording: state === "recording",
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",
    isError: state === "error",
    start,
    stop,
    speak,
    interrupt,
    error,
    lastTranscript,
    lastResponse,
  };
}
