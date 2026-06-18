import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentType,
} from "../types";

export interface PlanStep {
  id: string;
  description: string;
  action: string;
  params: Record<string, unknown>;
  dependencies: string[];
  status: "pending" | "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: "draft" | "ready" | "executing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export class PlannerAgent implements Agent {
  readonly type: AgentType = "planner";
  readonly config: AgentConfig;

  private status: AgentStatus = "idle";
  private plans: Map<string, Plan> = new Map();

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      type: "planner",
      name: "Planner",
      description: "Decomposes tasks and builds execution plans",
      maxConcurrentTasks: 1,
      timeout: 10000,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    this.status = "idle";
  }

  async execute(task: AgentTask): Promise<AgentTaskResult> {
    this.status = "running";

    try {
      const { action, params } = task.input;

      switch (action) {
        case "plan":
          return await this.createPlan(params.goal as string, params.context);
        case "execute_plan":
          return await this.executePlan(params.planId as string);
        case "get_plan":
          return await this.getPlan(params.planId as string);
        case "list_plans":
          return await this.listPlans();
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      this.status = "error";
      throw error;
    } finally {
      this.status = "idle";
    }
  }

  private async createPlan(
    goal: string,
    context?: unknown
  ): Promise<AgentTaskResult> {
    const plan = this.generatePlan(goal, context);
    this.plans.set(plan.id, plan);

    return {
      output: plan,
      metadata: {
        planId: plan.id,
        stepCount: plan.steps.length,
      },
    };
  }

  private generatePlan(goal: string, context?: unknown): Plan {
    const id = `plan_${Date.now()}`;
    const steps = this.decomposeGoal(goal, context);

    return {
      id,
      goal,
      steps,
      status: "ready",
      createdAt: new Date(),
    };
  }

  private decomposeGoal(goal: string, context?: unknown): PlanStep[] {
    const steps: PlanStep[] = [];
    const goalLower = goal.toLowerCase();

    if (goalLower.includes("open") || goalLower.includes("launch")) {
      steps.push({
        id: `step_${Date.now()}_1`,
        description: "Identify application to open",
        action: "identify_app",
        params: { goal },
        dependencies: [],
        status: "pending",
      });
      steps.push({
        id: `step_${Date.now()}_2`,
        description: "Execute open command",
        action: "system:open-app",
        params: { goal },
        dependencies: ["step_1"],
        status: "pending",
      });
    } else if (goalLower.includes("search") || goalLower.includes("find")) {
      steps.push({
        id: `step_${Date.now()}_1`,
        description: "Parse search query",
        action: "parse_query",
        params: { goal },
        dependencies: [],
        status: "pending",
      });
      steps.push({
        id: `step_${Date.now()}_2`,
        description: "Execute search",
        action: "search",
        params: { goal },
        dependencies: ["step_1"],
        status: "pending",
      });
    } else if (goalLower.includes("remember") || goalLower.includes("store")) {
      steps.push({
        id: `step_${Date.now()}_1`,
        description: "Extract information to store",
        action: "extract_info",
        params: { goal },
        dependencies: [],
        status: "pending",
      });
      steps.push({
        id: `step_${Date.now()}_2`,
        description: "Store in memory",
        action: "memory:store",
        params: { goal },
        dependencies: ["step_1"],
        status: "pending",
      });
    } else {
      steps.push({
        id: `step_${Date.now()}_1`,
        description: "Process request",
        action: "process",
        params: { goal },
        dependencies: [],
        status: "pending",
      });
    }

    return steps;
  }

  private async executePlan(planId: string): Promise<AgentTaskResult> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    plan.status = "executing";

    try {
      for (const step of plan.steps) {
        if (step.dependencies.length > 0) {
          const depsMet = step.dependencies.every((depId) => {
            const depStep = plan.steps.find((s) => s.id === depId);
            return depStep?.status === "completed";
          });

          if (!depsMet) {
            throw new Error(`Dependencies not met for step ${step.id}`);
          }
        }

        step.status = "running";

        try {
          step.result = await this.executeStep(step);
          step.status = "completed";
        } catch (error) {
          step.status = "failed";
          step.error = (error as Error).message;
          plan.status = "failed";
          throw error;
        }
      }

      plan.status = "completed";
      plan.completedAt = new Date();

      return {
        output: plan,
        metadata: {
          planId: plan.id,
          completedSteps: plan.steps.filter((s) => s.status === "completed").length,
        },
      };
    } catch (error) {
      plan.status = "failed";
      throw error;
    }
  }

  private async executeStep(step: PlanStep): Promise<unknown> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      stepId: step.id,
      action: step.action,
      executed: true,
    };
  }

  private async getPlan(planId: string): Promise<AgentTaskResult> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return { output: plan };
  }

  private async listPlans(): Promise<AgentTaskResult> {
    const plans = Array.from(this.plans.values());
    return {
      output: plans,
      metadata: { count: plans.length },
    };
  }

  async pause(): Promise<void> {
    this.status = "paused";
  }

  async resume(): Promise<void> {
    this.status = "idle";
  }

  async abort(): Promise<void> {
    this.plans.clear();
    this.status = "idle";
  }

  async destroy(): Promise<void> {
    await this.abort();
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getActivePlanCount(): number {
    return Array.from(this.plans.values()).filter(
      (p) => p.status === "executing"
    ).length;
  }
}
