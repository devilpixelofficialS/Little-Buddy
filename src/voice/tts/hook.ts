"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  KokoroConfig,
  SpeechOptions,
  TTSState,
  Voice,
  DEFAULT_KOKORO_CONFIG,
  AVAILABLE_VOICES,
} from "./types";
import { KokoroService } from "./service";

interface UseKokoroOptions {
  config?: Partial<KokoroConfig>;
  onStateChange?: (state: TTSState) => void;
  onComplete?: () => void;
}

interface UseKokoroReturn {
  state: TTSState;
  isReady: boolean;
  isSpeaking: boolean;
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  stop: () => Promise<void>;
  voices: Voice[];
  setVoice: (voiceId: string) => void;
  currentVoice: string;
  error: Error | null;
}

export function useKokoro(options: UseKokoroOptions = {}): UseKokoroReturn {
  const { config, onStateChange, onComplete } = options;

  const [state, setState] = useState<TTSState>("idle");
  const [currentVoice, setCurrentVoice] = useState(
    config?.voice ?? DEFAULT_KOKORO_CONFIG.voice
  );
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<KokoroService | null>(null);

  useEffect(() => {
    const service = new KokoroService(config ?? DEFAULT_KOKORO_CONFIG, {
      onStateChange: (newState) => {
        setState(newState);
        onStateChange?.(newState);
      },
      onComplete,
      onError: setError,
    });

    serviceRef.current = service;
    service.initialize();

    return () => {
      service.destroy();
    };
  }, []);

  const speak = useCallback(
    async (text: string, options?: SpeechOptions) => {
      try {
        setError(null);
        await serviceRef.current?.speak(text, options);
      } catch (err) {
        setError(err as Error);
      }
    },
    []
  );

  const stop = useCallback(async () => {
    try {
      await serviceRef.current?.stop();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const setVoice = useCallback((voiceId: string) => {
    serviceRef.current?.setVoice(voiceId);
    setCurrentVoice(voiceId);
  }, []);

  return {
    state,
    isReady: state === "ready",
    isSpeaking: state === "speaking",
    speak,
    stop,
    voices: AVAILABLE_VOICES,
    setVoice,
    currentVoice,
    error,
  };
}
