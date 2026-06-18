export type AgentType =
  | "orchestrator"
  | "planner"
  | "memory"
  | "context"
  | "execution";

export type AgentStatus =
  | "idle"
  | "initializing"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "error";

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  maxConcurrentTasks: number;
  timeout: number;
}

export interface AgentTask {
  id: string;
  type: AgentType;
  input: AgentTaskInput;
  status: AgentStatus;
  result?: AgentTaskResult;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AgentTaskInput {
  action: string;
  params: Record<string, unknown>;
  context?: AgentContext;
}

export interface AgentTaskResult {
  output: unknown;
  metadata?: Record<string, unknown>;
  nextActions?: string[];
}

export interface AgentContext {
  userId?: string;
  conversationId?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  memories?: string[];
  availableSkills?: string[];
}

export interface AgentMessage {
  id: string;
  type: "request" | "response" | "error" | "status";
  source: AgentType;
  target: AgentType;
  payload: unknown;
  timestamp: Date;
}

export interface Agent {
  readonly type: AgentType;
  readonly config: AgentConfig;
  getStatus(): AgentStatus;
  initialize(): Promise<void>;
  execute(task: AgentTask): Promise<AgentTaskResult>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  abort(): Promise<void>;
  destroy(): Promise<void>;
}
