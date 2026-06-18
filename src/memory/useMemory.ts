"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MemoryAgent } from "./agent";
import {
  MemoryEntry,
  MemoryCategory,
  MemoryStoreOptions,
  MemorySearchResult,
} from "./types";

interface UseMemoryOptions {
  userId: string;
  autoInitialize?: boolean;
}

interface UseMemoryReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  store: (content: string, options?: MemoryStoreOptions) => Promise<MemoryEntry | null>;
  search: (query: string, category?: MemoryCategory) => Promise<MemorySearchResult[]>;
  retrieve: (id: string) => Promise<MemoryEntry | null>;
  list: (category?: MemoryCategory) => Promise<MemoryEntry[]>;
  delete: (id: string) => Promise<void>;
  consolidate: () => Promise<void>;
  memories: MemoryEntry[];
}

export function useMemory(options: UseMemoryOptions): UseMemoryReturn {
  const { userId, autoInitialize = true } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const agentRef = useRef<MemoryAgent | null>(null);

  useEffect(() => {
    if (autoInitialize) {
      initializeMemory();
    }

    return () => {
      agentRef.current?.destroy();
    };
  }, [userId]);

  const initializeMemory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const agent = new MemoryAgent(userId);
      await agent.initialize();
      agentRef.current = agent;
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const store = useCallback(
    async (
      content: string,
      options?: MemoryStoreOptions
    ): Promise<MemoryEntry | null> => {
      try {
        setError(null);
        const agent = agentRef.current || new MemoryAgent(userId);

        const result = await agent.execute({
          id: `task_${Date.now()}`,
          type: "memory",
          input: {
            action: "memory:store",
            params: { content, options },
          },
          status: "idle",
          createdAt: new Date(),
        });

        const entry = result.output as MemoryEntry;
        setMemories((prev) => [entry, ...prev]);
        return entry;
      } catch (err) {
        setError(err as Error);
        return null;
      }
    },
    [userId]
  );

  const search = useCallback(
    async (
      query: string,
      category?: MemoryCategory
    ): Promise<MemorySearchResult[]> => {
      try {
        setError(null);
        const agent = agentRef.current || new MemoryAgent(userId);

        const result = await agent.execute({
          id: `task_${Date.now()}`,
          type: "memory",
          input: {
            action: "memory:search",
            params: { query, options: { category } },
          },
          status: "idle",
          createdAt: new Date(),
        });

        return result.output as MemorySearchResult[];
      } catch (err) {
        setError(err as Error);
        return [];
      }
    },
    [userId]
  );

  const retrieve = useCallback(
    async (id: string): Promise<MemoryEntry | null> => {
      try {
        setError(null);
        const agent = agentRef.current || new MemoryAgent(userId);

        const result = await agent.execute({
          id: `task_${Date.now()}`,
          type: "memory",
          input: {
            action: "memory:retrieve",
            params: { id },
          },
          status: "idle",
          createdAt: new Date(),
        });

        return result.output as MemoryEntry;
      } catch (err) {
        setError(err as Error);
        return null;
      }
    },
    [userId]
  );

  const list = useCallback(
    async (category?: MemoryCategory): Promise<MemoryEntry[]> => {
      try {
        setError(null);
        const agent = agentRef.current || new MemoryAgent(userId);

        const result = await agent.execute({
          id: `task_${Date.now()}`,
          type: "memory",
          input: {
            action: "memory:list",
            params: { category },
          },
          status: "idle",
          createdAt: new Date(),
        });

        const entries = result.output as MemoryEntry[];
        setMemories(entries);
        return entries;
      } catch (err) {
        setError(err as Error);
        return [];
      }
    },
    [userId]
  );

  const deleteMemory = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        const agent = agentRef.current || new MemoryAgent(userId);

        await agent.execute({
          id: `task_${Date.now()}`,
          type: "memory",
          input: {
            action: "memory:delete",
            params: { id },
          },
          status: "idle",
          createdAt: new Date(),
        });

        setMemories((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        setError(err as Error);
      }
    },
    [userId]
  );

  const consolidate = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const agent = agentRef.current || new MemoryAgent(userId);

      await agent.execute({
        id: `task_${Date.now()}`,
        type: "memory",
        input: {
          action: "memory:consolidate",
          params: {},
        },
        status: "idle",
        createdAt: new Date(),
      });
    } catch (err) {
      setError(err as Error);
    }
  }, [userId]);

  return {
    isInitialized,
    isLoading,
    error,
    store,
    search,
    retrieve,
    list,
    delete: deleteMemory,
    consolidate,
    memories,
  };
}
