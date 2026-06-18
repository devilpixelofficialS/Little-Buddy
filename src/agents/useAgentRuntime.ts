"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AgentRuntime,
  initializeAgentRuntime,
  getAgentRuntime,
} from "./runtime";
import { AgentTaskResult, AgentContext } from "./types";

interface UseAgentRuntimeOptions {
  autoInitialize?: boolean;
}

interface UseAgentRuntimeReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  processRequest: (
    input: string,
    context?: AgentContext
  ) => Promise<AgentTaskResult | null>;
  initialize: () => Promise<void>;
  runtime: AgentRuntime | null;
}

export function useAgentRuntime(
  options: UseAgentRuntimeOptions = {}
): UseAgentRuntimeReturn {
  const { autoInitialize = false } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const runtimeRef = useRef<AgentRuntime | null>(null);

  useEffect(() => {
    if (autoInitialize) {
      initializeRuntime();
    }

    return () => {
      runtimeRef.current?.destroy();
    };
  }, []);

  const initializeRuntime = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const runtime = await initializeAgentRuntime();
      runtimeRef.current = runtime;
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processRequest = useCallback(
    async (
      input: string,
      context?: AgentContext
    ): Promise<AgentTaskResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const runtime =
          runtimeRef.current || getAgentRuntime();

        if (!runtime.isInitialized()) {
          await runtime.initialize();
          runtimeRef.current = runtime;
          setIsInitialized(true);
        }

        const result = await runtime.processRequest(input, context);
        return result;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isInitialized,
    isLoading,
    error,
    processRequest,
    initialize: initializeRuntime,
    runtime: runtimeRef.current,
  };
}
