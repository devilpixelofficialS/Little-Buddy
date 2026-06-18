export type WorkflowTriggerType = "manual" | "schedule" | "event" | "voice";

export type WorkflowStepType =
  | "agent_task"
  | "skill_call"
  | "condition"
  | "delay"
  | "parallel"
  | "transform"
  | "output";

export type WorkflowStatus = "draft" | "active" | "paused" | "running" | "completed" | "failed";

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description?: string;
  config: StepConfig;
  next?: string;
  onError?: "stop" | "continue" | "retry";
  retryCount?: number;
  timeout?: number;
}

export type StepConfig =
  | AgentTaskConfig
  | SkillCallConfig
  | ConditionConfig
  | DelayConfig
  | ParallelConfig
  | TransformConfig
  | OutputConfig;

export interface AgentTaskConfig {
  agentType: string;
  action: string;
  params: Record<string, unknown>;
}

export interface SkillCallConfig {
  skillId: string;
  params: Record<string, unknown>;
}

export interface ConditionConfig {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "exists";
  value: unknown;
  trueStep?: string;
  falseStep?: string;
}

export interface DelayConfig {
  duration: number;
  unit: "ms" | "seconds" | "minutes" | "hours";
}

export interface ParallelConfig {
  steps: string[];
  waitForAll?: boolean;
}

export interface TransformConfig {
  inputField: string;
  outputField: string;
  transform: "uppercase" | "lowercase" | "trim" | "json_parse" | "json_stringify" | "extract" | "merge";
}

export interface OutputConfig {
  format: "text" | "json" | "markdown";
  template?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  runCount: number;
  tags: string[];
}

export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  defaultValue?: unknown;
  required: boolean;
  description?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  steps: StepRun[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
}

export interface StepRun {
  stepId: string;
  status: StepStatus;
  input?: unknown;
  output?: unknown;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  retryCount: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  tags: string[];
}
