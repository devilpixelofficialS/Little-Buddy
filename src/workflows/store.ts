import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Workflow,
  WorkflowRun,
  WorkflowStep,
  WorkflowVariable,
  WorkflowTrigger,
  WorkflowStatus,
} from "./types";

interface WorkflowState {
  workflows: Workflow[];
  runs: WorkflowRun[];
  activeWorkflowId: string | null;
  activeRunId: string | null;

  createWorkflow: (data: {
    name: string;
    description: string;
    trigger: WorkflowTrigger;
    steps?: WorkflowStep[];
    variables?: WorkflowVariable[];
  }) => Workflow;

  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => Workflow | null;

  addStep: (workflowId: string, step: WorkflowStep) => void;
  updateStep: (workflowId: string, stepId: string, data: Partial<WorkflowStep>) => void;
  removeStep: (workflowId: string, stepId: string) => void;
  reorderSteps: (workflowId: string, stepIds: string[]) => void;

  addVariable: (workflowId: string, variable: WorkflowVariable) => void;
  updateVariable: (workflowId: string, name: string, data: Partial<WorkflowVariable>) => void;
  removeVariable: (workflowId: string, name: string) => void;

  updateTrigger: (workflowId: string, trigger: WorkflowTrigger) => void;
  setWorkflowStatus: (workflowId: string, status: WorkflowStatus) => void;

  startRun: (workflowId: string, input: Record<string, unknown>) => WorkflowRun;
  updateRun: (runId: string, data: Partial<WorkflowRun>) => void;
  completeRun: (runId: string, output: Record<string, unknown>) => void;
  failRun: (runId: string, error: string) => void;

  setActiveWorkflow: (id: string | null) => void;
  setActiveRun: (id: string | null) => void;

  getWorkflow: (id: string) => Workflow | undefined;
  getRuns: (workflowId: string) => WorkflowRun[];
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      runs: [],
      activeWorkflowId: null,
      activeRunId: null,

      createWorkflow: (data) => {
        const workflow: Workflow = {
          id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description,
          version: "1.0.0",
          trigger: data.trigger,
          steps: data.steps || [],
          variables: data.variables || [],
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 0,
          tags: [],
        };

        set((state) => ({
          workflows: [...state.workflows, workflow],
        }));

        return workflow;
      },

      updateWorkflow: (id, data) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...data, updatedAt: new Date() } : w
          ),
        })),

      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          runs: state.runs.filter((r) => r.workflowId !== id),
          activeWorkflowId: state.activeWorkflowId === id ? null : state.activeWorkflowId,
        })),

      duplicateWorkflow: (id) => {
        const { workflows } = get();
        const original = workflows.find((w) => w.id === id);
        if (!original) return null;

        const duplicate: Workflow = {
          ...original,
          id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${original.name} (Copy)`,
          status: "draft",
          runCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastRunAt: undefined,
        };

        set((state) => ({
          workflows: [...state.workflows, duplicate],
        }));

        return duplicate;
      },

      addStep: (workflowId, step) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, steps: [...w.steps, step], updatedAt: new Date() }
              : w
          ),
        })),

      updateStep: (workflowId, stepId, data) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  steps: w.steps.map((s) =>
                    s.id === stepId ? { ...s, ...data } : s
                  ),
                  updatedAt: new Date(),
                }
              : w
          ),
        })),

      removeStep: (workflowId, stepId) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, steps: w.steps.filter((s) => s.id !== stepId), updatedAt: new Date() }
              : w
          ),
        })),

      reorderSteps: (workflowId, stepIds) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const stepMap = new Map(w.steps.map((s) => [s.id, s]));
            const reordered = stepIds
              .map((id) => stepMap.get(id))
              .filter((s): s is WorkflowStep => s !== undefined);
            return { ...w, steps: reordered, updatedAt: new Date() };
          }),
        })),

      addVariable: (workflowId, variable) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, variables: [...w.variables, variable], updatedAt: new Date() }
              : w
          ),
        })),

      updateVariable: (workflowId, name, data) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  variables: w.variables.map((v) =>
                    v.name === name ? { ...v, ...data } : v
                  ),
                  updatedAt: new Date(),
                }
              : w
          ),
        })),

      removeVariable: (workflowId, name) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, variables: w.variables.filter((v) => v.name !== name), updatedAt: new Date() }
              : w
          ),
        })),

      updateTrigger: (workflowId, trigger) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, trigger, updatedAt: new Date() }
              : w
          ),
        })),

      setWorkflowStatus: (workflowId, status) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, status, updatedAt: new Date() }
              : w
          ),
        })),

      startRun: (workflowId, input) => {
        const run: WorkflowRun = {
          id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          workflowId,
          status: "running",
          input,
          steps: [],
          startedAt: new Date(),
        };

        set((state) => ({
          runs: [...state.runs, run],
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, runCount: w.runCount + 1, lastRunAt: new Date() }
              : w
          ),
        }));

        return run;
      },

      updateRun: (runId, data) =>
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === runId ? { ...r, ...data } : r
          ),
        })),

      completeRun: (runId, output) =>
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  status: "completed",
                  output,
                  completedAt: new Date(),
                  duration: Date.now() - r.startedAt.getTime(),
                }
              : r
          ),
        })),

      failRun: (runId, error) =>
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  status: "failed",
                  error,
                  completedAt: new Date(),
                  duration: Date.now() - r.startedAt.getTime(),
                }
              : r
          ),
        })),

      setActiveWorkflow: (id) => set({ activeWorkflowId: id }),
      setActiveRun: (id) => set({ activeRunId: id }),

      getWorkflow: (id) => get().workflows.find((w) => w.id === id),

      getRuns: (workflowId) =>
        get().runs
          .filter((r) => r.workflowId === workflowId)
          .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()),
    }),
    {
      name: "little-buddy-workflows",
    }
  )
);
