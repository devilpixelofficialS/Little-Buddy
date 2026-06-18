"use client";

import { useState, useCallback } from "react";
import { ipc } from "@/lib/ipc";

interface UseDatabaseOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDatabaseReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useDatabase<T>(
  operation: (...args: unknown[]) => Promise<T>,
  options: UseDatabaseOptions<T> = {}
): UseDatabaseReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await operation(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [operation, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}

export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<
    Array<{ id: string; title: string | null; createdAt: Date }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ipc.invoke("db:conversations:list", userId);
      setConversations(result as typeof conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createConversation = useCallback(
    async (title: string | null, firstMessage: string) => {
      try {
        const result = await ipc.invoke(
          "db:conversations:create",
          userId,
          title,
          firstMessage
        );
        await loadConversations();
        return result;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
      }
    },
    [userId, loadConversations]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await ipc.invoke("db:conversations:delete", id);
        await loadConversations();
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        throw error;
      }
    },
    [loadConversations]
  );

  return {
    conversations,
    isLoading,
    loadConversations,
    createConversation,
    deleteConversation,
  };
}

export function useMemories(userId: string) {
  const [memories, setMemories] = useState<
    Array<{
      id: string;
      content: string;
      category: string;
      createdAt: Date;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMemories = useCallback(
    async (category?: string) => {
      setIsLoading(true);
      try {
        const result = await ipc.invoke(
          "db:memories:list",
          userId,
          category
        );
        setMemories(result as typeof memories);
      } catch (error) {
        console.error("Failed to load memories:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const storeMemory = useCallback(
    async (content: string, category: string) => {
      try {
        const result = await ipc.invoke(
          "db:memories:store",
          userId,
          content,
          category
        );
        await loadMemories();
        return result;
      } catch (error) {
        console.error("Failed to store memory:", error);
        throw error;
      }
    },
    [userId, loadMemories]
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      try {
        await ipc.invoke("db:memories:delete", id);
        await loadMemories();
      } catch (error) {
        console.error("Failed to delete memory:", error);
        throw error;
      }
    },
    [loadMemories]
  );

  return {
    memories,
    isLoading,
    loadMemories,
    storeMemory,
    deleteMemory,
  };
}

export function useSkills() {
  const [skills, setSkills] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      enabled: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ipc.invoke("db:skills:list");
      setSkills(result as typeof skills);
    } catch (error) {
      console.error("Failed to load skills:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSkill = useCallback(
    async (id: string) => {
      try {
        await ipc.invoke("db:skills:toggle", id);
        await loadSkills();
      } catch (error) {
        console.error("Failed to toggle skill:", error);
        throw error;
      }
    },
    [loadSkills]
  );

  return {
    skills,
    isLoading,
    loadSkills,
    toggleSkill,
  };
}
