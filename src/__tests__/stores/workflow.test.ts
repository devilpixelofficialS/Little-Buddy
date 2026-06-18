import { useWorkflowStore } from "@/workflows/store";
import type { WorkflowStep } from "@/workflows/types";

const validTrigger = { type: "manual" as const, config: {}, enabled: true };

const validStep: WorkflowStep = {
  id: "step_1",
  type: "agent_task",
  name: "First Step",
  config: { agentType: "orchestrator", action: "process", params: {} },
};

describe("WorkflowStore", () => {
  beforeEach(() => {
    useWorkflowStore.setState({ workflows: [], runs: [], activeWorkflowId: null, activeRunId: null });
  });

  it("should create a workflow", () => {
    const { createWorkflow } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "A test workflow",
      trigger: validTrigger,
    });

    expect(workflow.name).toBe("Test Workflow");
    expect(workflow.status).toBe("draft");
    expect(workflow.runCount).toBe(0);
    expect(workflow.steps).toEqual([]);
    expect(workflow.variables).toEqual([]);
  });

  it("should update a workflow", () => {
    const { createWorkflow, updateWorkflow } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "Original description",
      trigger: validTrigger,
    });

    updateWorkflow(workflow.id, {
      name: "Updated Workflow",
      description: "Updated description",
    });

    const updated = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updated?.name).toBe("Updated Workflow");
    expect(updated?.description).toBe("Updated description");
  });

  it("should delete a workflow", () => {
    const { createWorkflow, deleteWorkflow } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "To be deleted",
      trigger: validTrigger,
    });

    deleteWorkflow(workflow.id);

    const workflows = useWorkflowStore.getState().workflows;
    expect(workflows.find((w) => w.id === workflow.id)).toBeUndefined();
  });

  it("should duplicate a workflow", () => {
    const { createWorkflow, duplicateWorkflow } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Original",
      description: "Original workflow",
      trigger: validTrigger,
    });

    const duplicate = duplicateWorkflow(workflow.id);

    expect(duplicate).not.toBeNull();
    expect(duplicate?.name).toBe("Original (Copy)");
    expect(duplicate?.status).toBe("draft");
    expect(duplicate?.id).not.toBe(workflow.id);
  });

  it("should return null for duplicate if not found", () => {
    const { duplicateWorkflow } = useWorkflowStore.getState();

    const result = duplicateWorkflow("nonexistent-id");
    expect(result).toBeNull();
  });

  it("should add a step", () => {
    const { createWorkflow, addStep } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "With steps",
      trigger: validTrigger,
    });

    addStep(workflow.id, { ...validStep, id: "step_1" });

    const updated = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updated?.steps).toHaveLength(1);
    expect(updated?.steps[0].name).toBe("First Step");
  });

  it("should remove a step", () => {
    const { createWorkflow, addStep, removeStep } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "With steps",
      trigger: validTrigger,
    });

    addStep(workflow.id, { ...validStep, id: "step_1" });
    removeStep(workflow.id, "step_1");

    const updated = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updated?.steps).toHaveLength(0);
  });

  it("should add a variable", () => {
    const { createWorkflow, addVariable } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "With variables",
      trigger: validTrigger,
    });

    addVariable(workflow.id, {
      name: "username",
      type: "string",
      defaultValue: "admin",
      required: true,
    });

    const updated = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updated?.variables).toHaveLength(1);
    expect(updated?.variables[0].name).toBe("username");
  });

  it("should start a run", () => {
    const { createWorkflow, startRun } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "To be run",
      trigger: validTrigger,
    });

    const run = startRun(workflow.id, { input: "test" });

    expect(run.status).toBe("running");
    expect(run.workflowId).toBe(workflow.id);

    const updatedWorkflow = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updatedWorkflow?.runCount).toBe(1);
  });

  it("should complete a run", () => {
    const { createWorkflow, startRun, completeRun } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "To be run",
      trigger: validTrigger,
    });

    const run = startRun(workflow.id, { input: "test" });
    completeRun(run.id, { output: "done" });

    const completedRun = useWorkflowStore.getState().runs.find((r) => r.id === run.id);
    expect(completedRun?.status).toBe("completed");
    expect(completedRun?.output).toEqual({ output: "done" });
    expect(completedRun?.completedAt).toBeDefined();
  });

  it("should fail a run", () => {
    const { createWorkflow, startRun, failRun } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "To be run",
      trigger: validTrigger,
    });

    const run = startRun(workflow.id, { input: "test" });
    failRun(run.id, "Something went wrong");

    const failedRun = useWorkflowStore.getState().runs.find((r) => r.id === run.id);
    expect(failedRun?.status).toBe("failed");
    expect(failedRun?.error).toBe("Something went wrong");
  });

  it("should set workflow status", () => {
    const { createWorkflow, setWorkflowStatus } = useWorkflowStore.getState();

    const workflow = createWorkflow({
      name: "Test Workflow",
      description: "Status test",
      trigger: validTrigger,
    });

    setWorkflowStatus(workflow.id, "active");

    const updated = useWorkflowStore.getState().workflows.find((w) => w.id === workflow.id);
    expect(updated?.status).toBe("active");
  });
});
