import { OrchestratorAgent } from "./orchestrator/service";
import { PlannerAgent } from "./planner/service";
import { ContextAgent } from "./context/service";
import { ExecutionAgent } from "./execution/service";
import { MemoryAgent } from "../memory/agent";
import {
  Agent,
  AgentType,
  AgentTask,
  AgentTaskResult,
  AgentContext,
} from "./types";

export interface AgentRuntimeConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  userId?: string;
}

const DEFAULT_CONFIG: AgentRuntimeConfig = {
  maxConcurrentTasks: 5,
  taskTimeout: 30000,
};

export class AgentRuntime {
  private orchestrator: OrchestratorAgent;
  private agents: Map<AgentType, Agent> = new Map();
  private config: AgentRuntimeConfig;
  private initialized = false;

  constructor(config: Partial<AgentRuntimeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.orchestrator = new OrchestratorAgent({
      maxConcurrentTasks: this.config.maxConcurrentTasks,
      timeout: this.config.taskTimeout,
    });

    this.registerDefaultAgents();
  }

  private registerDefaultAgents(): void {
    const planner = new PlannerAgent({ timeout: this.config.taskTimeout });
    const context = new ContextAgent({ timeout: this.config.taskTimeout });
    const execution = new ExecutionAgent({ timeout: this.config.taskTimeout });

    this.agents.set("orchestrator", this.orchestrator);
    this.agents.set("planner", planner);
    this.agents.set("context", context);
    this.agents.set("execution", execution);

    this.orchestrator.registerAgent(planner);
    this.orchestrator.registerAgent(context);
    this.orchestrator.registerAgent(execution);
  }

  registerMemoryAgent(userId: string): void {
    const memory = new MemoryAgent(userId, {
      timeout: this.config.taskTimeout,
    });

    this.agents.set("memory", memory);
    this.orchestrator.registerAgent(memory);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.orchestrator.initialize();
      this.initialized = true;
      console.log("Agent runtime initialized successfully");
    } catch (error) {
      console.error("Failed to initialize agent runtime:", error);
      throw error;
    }
  }

  async processRequest(
    input: string,
    context?: AgentContext
  ): Promise<AgentTaskResult> {
    if (!this.initialized) {
      throw new Error("Agent runtime not initialized");
    }

    const task: AgentTask = {
      id: `task_${Date.now()}`,
      type: "orchestrator",
      input: {
        action: input,
        params: { input },
        context,
      },
      status: "idle",
      createdAt: new Date(),
    };

    return this.orchestrator.execute(task);
  }

  async executeTask(task: AgentTask): Promise<AgentTaskResult> {
    if (!this.initialized) {
      throw new Error("Agent runtime not initialized");
    }

    return this.orchestrator.execute(task);
  }

  getAgent(type: AgentType): Agent | undefined {
    return this.agents.get(type);
  }

  getOrchestrator(): OrchestratorAgent {
    return this.orchestrator;
  }

  getMemoryAgent(): MemoryAgent | undefined {
    return this.agents.get("memory") as MemoryAgent | undefined;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async destroy(): Promise<void> {
    await this.orchestrator.destroy();
    this.agents.clear();
    this.initialized = false;
  }
}

let runtimeInstance: AgentRuntime | null = null;

export function getAgentRuntime(
  config?: Partial<AgentRuntimeConfig>
): AgentRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new AgentRuntime(config);
  }
  return runtimeInstance;
}

export async function initializeAgentRuntime(
  config?: Partial<AgentRuntimeConfig>
): Promise<AgentRuntime> {
  const runtime = getAgentRuntime(config);
  await runtime.initialize();
  return runtime;
}
