"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WhisperConfig,
  TranscriptionResult,
  WhisperState,
  DEFAULT_WHISPER_CONFIG,
} from "./types";
import { WhisperService } from "./service";

interface UseWhisperOptions {
  config?: Partial<WhisperConfig>;
  onResult?: (result: TranscriptionResult) => void;
  onPartialResult?: (text: string) => void;
}

interface UseWhisperReturn {
  state: WhisperState;
  isReady: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribe: (audioBlob: Blob) => Promise<TranscriptionResult>;
  lastResult: TranscriptionResult | null;
  error: Error | null;
}

export function useWhisper(
  options: UseWhisperOptions = {}
): UseWhisperReturn {
  const { config, onResult, onPartialResult } = options;

  const [state, setState] = useState<WhisperState>("idle");
  const [lastResult, setLastResult] = useState<TranscriptionResult | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<WhisperService | null>(null);

  useEffect(() => {
    const service = new WhisperService(config ?? DEFAULT_WHISPER_CONFIG, {
      onStateChange: setState,
      onResult: (result) => {
        setLastResult(result);
        onResult?.(result);
      },
      onPartialResult,
      onError: setError,
    });

    serviceRef.current = service;
    service.initialize();

    return () => {
      service.destroy();
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await serviceRef.current?.startRecording();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await serviceRef.current?.stopRecording();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const transcribe = useCallback(
    async (audioBlob: Blob): Promise<TranscriptionResult> => {
      try {
        setError(null);
        const result = await serviceRef.current!.transcribe(audioBlob);
        setLastResult(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  return {
    state,
    isReady: state === "ready",
    isTranscribing: state === "transcribing",
    startRecording,
    stopRecording,
    transcribe,
    lastResult,
    error,
  };
}
