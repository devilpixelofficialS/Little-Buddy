import {
  Workflow,
  WorkflowRun,
  WorkflowStep,
  StepRun,
  StepConfig,
  AgentTaskConfig,
  SkillCallConfig,
  ConditionConfig,
  DelayConfig,
} from "./types";

export class WorkflowExecutor {
  private workflow: Workflow;
  private variables: Map<string, unknown> = new Map();
  private stepOutputs: Map<string, unknown> = new Map();

  constructor(workflow: Workflow) {
    this.workflow = workflow;
  }

  async execute(
    input: Record<string, unknown>,
    onStepComplete?: (stepRun: StepRun) => void
  ): Promise<Record<string, unknown>> {
    this.variables.clear();
    this.stepOutputs.clear();

    for (const [key, value] of Object.entries(input)) {
      this.variables.set(key, value);
    }

    for (const variable of this.workflow.variables) {
      if (variable.defaultValue !== undefined && !this.variables.has(variable.name)) {
        this.variables.set(variable.name, variable.defaultValue);
      }
    }

    const stepRuns: StepRun[] = [];

    for (const step of this.workflow.steps) {
      const stepRun: StepRun = {
        stepId: step.id,
        status: "running",
        input: this.resolveStepInput(step),
        startedAt: new Date(),
        retryCount: 0,
      };

      try {
        const output = await this.executeStep(step);
        stepRun.output = output;
        stepRun.status = "completed";
        stepRun.completedAt = new Date();
        stepRun.duration = Date.now() - stepRun.startedAt.getTime();

        this.stepOutputs.set(step.id, output);

        if (step.type === "output") {
          return output as Record<string, unknown>;
        }
      } catch (error) {
        stepRun.status = "failed";
        stepRun.error = error instanceof Error ? error.message : "Unknown error";
        stepRun.completedAt = new Date();
        stepRun.duration = Date.now() - stepRun.startedAt.getTime();

        if (step.onError === "stop" || !step.onError) {
          throw error;
        }

        if (step.onError === "retry" && step.retryCount) {
          for (let i = 0; i < step.retryCount; i++) {
            try {
              const retryOutput = await this.executeStep(step);
              stepRun.output = retryOutput;
              stepRun.status = "completed";
              stepRun.error = undefined;
              stepRun.retryCount = i + 1;
              this.stepOutputs.set(step.id, retryOutput);
              break;
            } catch (retryError) {
              if (i === step.retryCount - 1) {
                throw retryError;
              }
            }
          }
        }
      }

      stepRuns.push(stepRun);
      onStepComplete?.(stepRun);
    }

    return this.buildOutput();
  }

  private resolveStepInput(step: WorkflowStep): unknown {
    const config = step.config as StepConfig;
    if ("params" in config) {
      return this.resolveVariables(config.params as Record<string, unknown>);
    }
    return config;
  }

  private resolveVariables(obj: Record<string, unknown>): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string" && value.startsWith("${")) {
        const varName = value.slice(2, -1);
        resolved[key] = this.variables.get(varName) ?? this.stepOutputs.get(varName);
      } else if (typeof value === "object" && value !== null) {
        resolved[key] = this.resolveVariables(value as Record<string, unknown>);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private async executeStep(step: WorkflowStep): Promise<unknown> {
    const config = step.config as StepConfig;

    switch (step.type) {
      case "agent_task":
        return this.executeAgentTask(config as AgentTaskConfig);

      case "skill_call":
        return this.executeSkillCall(config as SkillCallConfig);

      case "condition":
        return this.evaluateCondition(config as ConditionConfig);

      case "delay":
        return this.executeDelay(config as DelayConfig);

      case "transform":
        return this.executeTransform(config as unknown as Record<string, unknown>);

      case "output":
        return this.buildOutput();

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAgentTask(config: AgentTaskConfig): Promise<unknown> {
    try {
      const result = await window.electron?.invoke("agent:process", config.action, {
        agentType: config.agentType,
        params: this.resolveVariables(config.params),
      });
      return result;
    } catch (error) {
      throw new Error(`Agent task failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async executeSkillCall(config: SkillCallConfig): Promise<unknown> {
    try {
      const result = await window.electron?.invoke("skill:execute", {
        skillId: config.skillId,
        params: this.resolveVariables(config.params),
      });
      return result;
    } catch (error) {
      throw new Error(`Skill call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private evaluateCondition(config: ConditionConfig): boolean {
    const value = this.variables.get(config.field) ?? this.stepOutputs.get(config.field);

    switch (config.operator) {
      case "equals":
        return value === config.value;
      case "not_equals":
        return value !== config.value;
      case "contains":
        return String(value).includes(String(config.value));
      case "greater_than":
        return Number(value) > Number(config.value);
      case "less_than":
        return Number(value) < Number(config.value);
      case "exists":
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private async executeDelay(config: DelayConfig): Promise<void> {
    let ms = config.duration;
    switch (config.unit) {
      case "seconds":
        ms *= 1000;
        break;
      case "minutes":
        ms *= 60000;
        break;
      case "hours":
        ms *= 3600000;
        break;
    }
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private executeTransform(config: Record<string, unknown>): unknown {
    const inputField = config.inputField as string;
    const outputField = config.outputField as string;
    const transform = config.transform as string;

    let value = this.variables.get(inputField) ?? this.stepOutputs.get(inputField);

    switch (transform) {
      case "uppercase":
        value = String(value).toUpperCase();
        break;
      case "lowercase":
        value = String(value).toLowerCase();
        break;
      case "trim":
        value = String(value).trim();
        break;
      case "json_parse":
        value = JSON.parse(String(value));
        break;
      case "json_stringify":
        value = JSON.stringify(value);
        break;
    }

    this.variables.set(outputField, value);
    return value;
  }

  private buildOutput(): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [key, value] of this.variables) {
      if (!key.startsWith("_")) {
        output[key] = value;
      }
    }

    for (const [key, value] of this.stepOutputs) {
      output[key] = value;
    }

    return output;
  }
}
