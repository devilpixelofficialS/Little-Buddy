"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SkillRegistry } from "./registry";
import {
  Skill,
  SkillCategory,
  SkillExecutionResult,
  SkillExecutionContext,
} from "./types";
import { OpenApplicationSkill, TerminalCommandSkill } from "./desktop";
import { OpenWebsiteSkill } from "./browser";
import { ReadFileSkill, WriteFileSkill, ListDirectorySkill } from "./filesystem";

interface UseSkillsReturn {
  isInitialized: boolean;
  skills: Skill[];
  selectedSkill: Skill | null;
  isExecuting: boolean;
  lastResult: SkillExecutionResult | null;
  error: Error | null;
  register: (skill: Skill) => void;
  unregister: (id: string) => void;
  select: (id: string) => void;
  execute: (
    skillId: string,
    params: Record<string, unknown>,
    context?: SkillExecutionContext
  ) => Promise<SkillExecutionResult | null>;
  getByCategory: (category: SkillCategory) => Skill[];
  search: (query: string) => Skill[];
}

export function useSkills(): UseSkillsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<SkillExecutionResult | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const registryRef = useRef<SkillRegistry | null>(null);

  useEffect(() => {
    initializeRegistry();
  }, []);

  const initializeRegistry = useCallback(() => {
    try {
      const registry = new SkillRegistry();

      registry.register(new OpenApplicationSkill());
      registry.register(new TerminalCommandSkill());
      registry.register(new OpenWebsiteSkill());
      registry.register(new ReadFileSkill());
      registry.register(new WriteFileSkill());
      registry.register(new ListDirectorySkill());

      registryRef.current = registry;
      setSkills(registry.getAll());
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const register = useCallback((skill: Skill) => {
    try {
      registryRef.current?.register(skill);
      setSkills(registryRef.current?.getAll() ?? []);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const unregister = useCallback((id: string) => {
    registryRef.current?.unregister(id);
    setSkills(registryRef.current?.getAll() ?? []);
  }, []);

  const select = useCallback(
    (id: string) => {
      const skill = registryRef.current?.get(id);
      setSelectedSkill(skill ?? null);
    },
    []
  );

  const execute = useCallback(
    async (
      skillId: string,
      params: Record<string, unknown>,
      context?: SkillExecutionContext
    ): Promise<SkillExecutionResult | null> => {
      try {
        setIsExecuting(true);
        setError(null);

        const result = await registryRef.current?.execute(
          skillId,
          params,
          context
        );

        if (result) {
          setLastResult(result);
        }

        return result ?? null;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsExecuting(false);
      }
    },
    []
  );

  const getByCategory = useCallback(
    (category: SkillCategory): Skill[] => {
      return registryRef.current?.getByCategory(category) ?? [];
    },
    []
  );

  const search = useCallback((query: string): Skill[] => {
    return registryRef.current?.search(query) ?? [];
  }, []);

  return {
    isInitialized,
    skills,
    selectedSkill,
    isExecuting,
    lastResult,
    error,
    register,
    unregister,
    select,
    execute,
    getByCategory,
    search,
  };
}
