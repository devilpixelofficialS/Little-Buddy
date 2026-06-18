"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WakeWordConfig,
  WakeWordDetection,
  WakeWordState,
  DEFAULT_WAKEWORD_CONFIG,
} from "./types";
import { WakeWordService } from "./service";

interface UseWakeWordOptions {
  config?: Partial<WakeWordConfig>;
  autoStart?: boolean;
  onDetection?: (detection: WakeWordDetection) => void;
}

interface UseWakeWordReturn {
  state: WakeWordState;
  isListening: boolean;
  isDetected: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  error: Error | null;
}

export function useWakeWord(
  options: UseWakeWordOptions = {}
): UseWakeWordReturn {
  const { config, autoStart = false, onDetection } = options;

  const [state, setState] = useState<WakeWordState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<WakeWordService | null>(null);

  useEffect(() => {
    const service = new WakeWordService(config ?? DEFAULT_WAKEWORD_CONFIG, {
      onStateChange: setState,
      onDetection: (detection) => {
        onDetection?.(detection);
      },
      onError: setError,
    });

    serviceRef.current = service;

    service.initialize().then(() => {
      if (autoStart) {
        service.startListening();
      }
    });

    return () => {
      service.destroy();
    };
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      await serviceRef.current?.startListening();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await serviceRef.current?.stopListening();
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  return {
    state,
    isListening: state === "listening",
    isDetected: state === "detected",
    start,
    stop,
    error,
  };
}
