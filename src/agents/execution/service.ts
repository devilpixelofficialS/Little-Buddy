import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentType,
} from "../types";

export class ExecutionAgent implements Agent {
  readonly type: AgentType = "execution";
  readonly config: AgentConfig;

  private status: AgentStatus = "idle";
  private executionHistory: Array<{
    id: string;
    action: string;
    result: unknown;
    timestamp: Date;
  }> = [];

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      type: "execution",
      name: "Execution",
      description: "Executes skills and controls desktop",
      maxConcurrentTasks: 3,
      timeout: 30000,
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

      let result: unknown;

      switch (action) {
        case "system:open-app":
          result = await this.openApplication(params.appName as string);
          break;
        case "system:terminal":
          result = await this.executeTerminalCommand(params.command as string);
          break;
        case "skill:execute":
          result = await this.executeSkill(
            params.skillId as string,
            params.params as Record<string, unknown>
          );
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.executionHistory.push({
        id: task.id,
        action,
        result,
        timestamp: new Date(),
      });

      return {
        output: result,
        metadata: { action, executedAt: new Date().toISOString() },
      };
    } catch (error) {
      this.status = "error";
      throw error;
    } finally {
      this.status = "idle";
    }
  }

  private async openApplication(appName: string): Promise<unknown> {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    try {
      let command: string;

      switch (process.platform) {
        case "win32":
          command = `start ${appName}`;
          break;
        case "darwin":
          command = `open -a "${appName}"`;
          break;
        default:
          command = appName;
      }

      await execAsync(command);
      return { success: true, appName };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async executeTerminalCommand(command: string): Promise<unknown> {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
      return { stdout, stderr, success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async executeSkill(
    skillId: string,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    return {
      skillId,
      params,
      executed: true,
      message: "Skill execution placeholder - implement skill registry",
    };
  }

  async pause(): Promise<void> {
    this.status = "paused";
  }

  async resume(): Promise<void> {
    this.status = "idle";
  }

  async abort(): Promise<void> {
    this.status = "idle";
  }

  async destroy(): Promise<void> {
    this.executionHistory = [];
    this.status = "idle";
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getExecutionHistory(): typeof this.executionHistory {
    return [...this.executionHistory];
  }
}
