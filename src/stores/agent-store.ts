import { create } from "zustand";

export type AgentStatus =
  | "idle"
  | "planning"
  | "executing"
  | "completed"
  | "error";

export interface AgentTask {
  id: string;
  agentName: string;
  task: string;
  status: AgentStatus;
  result?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

interface AgentStore {
  tasks: AgentTask[];
  currentTask: AgentTask | null;
  addTask: (task: AgentTask) => void;
  updateTask: (id: string, updates: Partial<AgentTask>) => void;
  removeTask: (id: string) => void;
  setCurrentTask: (task: AgentTask | null) => void;
  clearTasks: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  tasks: [],
  currentTask: null,
  addTask: (task) =>
    set((s) => ({
      tasks: [...s.tasks, task],
      currentTask: task,
    })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTask:
        s.currentTask?.id === id
          ? { ...s.currentTask, ...updates }
          : s.currentTask,
    })),
  removeTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      currentTask: s.currentTask?.id === id ? null : s.currentTask,
    })),
  setCurrentTask: (task) => set({ currentTask: task }),
  clearTasks: () => set({ tasks: [], currentTask: null }),
}));
