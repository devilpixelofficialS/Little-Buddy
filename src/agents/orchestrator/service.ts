import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentType,
  AgentContext,
} from "../types";

export interface RoutingRule {
  pattern: RegExp;
  targetAgent: AgentType;
  priority: number;
}

export class OrchestratorAgent implements Agent {
  readonly type: AgentType = "orchestrator";
  readonly config: AgentConfig;

  private status: AgentStatus = "idle";
  private agents: Map<AgentType, Agent> = new Map();
  private routingRules: RoutingRule[] = [];
  private taskQueue: AgentTask[] = [];
  private activeTasks: Map<string, AgentTask> = new Map();

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      type: "orchestrator",
      name: "Orchestrator",
      description: "Routes requests and coordinates agent execution",
      maxConcurrentTasks: 5,
      timeout: 30000,
      ...config,
    };

    this.setupDefaultRoutingRules();
  }

  private setupDefaultRoutingRules(): void {
    this.routingRules = [
      {
        pattern: /^(plan|plan|decompose|break down)/i,
        targetAgent: "planner",
        priority: 1,
      },
      {
        pattern: /^(remember|recall|memory|store)/i,
        targetAgent: "memory",
        priority: 2,
      },
      {
        pattern: /^(what|where|how|show|get|find|search)/i,
        targetAgent: "context",
        priority: 3,
      },
      {
        pattern: /^(open|run|execute|start|launch|do)/i,
        targetAgent: "execution",
        priority: 4,
      },
    ];
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.type, agent);
  }

  unregisterAgent(type: AgentType): void {
    this.agents.delete(type);
  }

  getAgent(type: AgentType): Agent | undefined {
    return this.agents.get(type);
  }

  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.push(rule);
    this.routingRules.sort((a, b) => a.priority - b.priority);
  }

  private routeTask(task: AgentTask): AgentType {
    const input = task.input.action;

    for (const rule of this.routingRules) {
      if (rule.pattern.test(input)) {
        return rule.targetAgent;
      }
    }

    return "orchestrator";
  }

  async initialize(): Promise<void> {
    this.setStatus("initializing");

    try {
      for (const agent of this.agents.values()) {
        await agent.initialize();
      }
      this.setStatus("idle");
    } catch (error) {
      this.setStatus("error");
      throw error;
    }
  }

  async execute(task: AgentTask): Promise<AgentTaskResult> {
    if (this.status === "running" && this.activeTasks.size >= this.config.maxConcurrentTasks) {
      this.taskQueue.push(task);
      return { output: null, metadata: { queued: true } };
    }

    this.setStatus("running");
    this.activeTasks.set(task.id, task);
    task.status = "running";
    task.startedAt = new Date();

    try {
      const targetAgentType = this.routeTask(task);
      const targetAgent = this.agents.get(targetAgentType);

      if (!targetAgent) {
        throw new Error(`Agent ${targetAgentType} not registered`);
      }

      const result = await targetAgent.execute(task);

      task.status = "completed";
      task.result = result;
      task.completedAt = new Date();

      return result;
    } catch (error) {
      task.status = "failed";
      task.error = (error as Error).message;
      throw error;
    } finally {
      this.activeTasks.delete(task.id);

      if (this.taskQueue.length > 0 && this.activeTasks.size < this.config.maxConcurrentTasks) {
        const nextTask = this.taskQueue.shift()!;
        this.execute(nextTask);
      }

      if (this.activeTasks.size === 0) {
        this.setStatus("idle");
      }
    }
  }

  async pause(): Promise<void> {
    this.setStatus("paused");
  }

  async resume(): Promise<void> {
    if (this.taskQueue.length > 0) {
      this.setStatus("running");
      const nextTask = this.taskQueue.shift()!;
      this.execute(nextTask);
    } else {
      this.setStatus("idle");
    }
  }

  async abort(): Promise<void> {
    for (const task of this.activeTasks.values()) {
      task.status = "failed";
      task.error = "Aborted by orchestrator";
      task.completedAt = new Date();
    }

    this.activeTasks.clear();
    this.taskQueue = [];
    this.setStatus("idle");
  }

  async destroy(): Promise<void> {
    await this.abort();

    for (const agent of this.agents.values()) {
      await agent.destroy();
    }

    this.agents.clear();
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  private setStatus(status: AgentStatus): void {
    this.status = status;
  }

  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  getQueuedTaskCount(): number {
    return this.taskQueue.length;
  }

  getRegisteredAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }
}
