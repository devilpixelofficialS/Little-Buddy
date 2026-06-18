import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentType,
} from "../types";

export interface SystemContext {
  platform: string;
  hostname: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  activeWindows?: string[];
  runningProcesses?: string[];
}

export class ContextAgent implements Agent {
  readonly type: AgentType = "context";
  readonly config: AgentConfig;

  private status: AgentStatus = "idle";

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      type: "context",
      name: "Context",
      description: "Gathers system state and file context",
      maxConcurrentTasks: 3,
      timeout: 5000,
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
        case "get_system_context":
          return await this.getSystemContext();
        case "get_file_context":
          return await this.getFileContext(params.path as string);
        case "get_clipboard":
          return await this.getClipboard();
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

  private async getSystemContext(): Promise<AgentTaskResult> {
    const context: SystemContext = {
      platform: process.platform,
      hostname: require("os").hostname(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };

    return {
      output: context,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async getFileContext(path: string): Promise<AgentTaskResult> {
    const fs = require("fs").promises;

    try {
      const stats = await fs.stat(path);
      const content = stats.isFile()
        ? await fs.readFile(path, "utf-8")
        : null;

      return {
        output: {
          path,
          exists: true,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
          content: content?.substring(0, 1000),
        },
      };
    } catch {
      return {
        output: {
          path,
          exists: false,
        },
      };
    }
  }

  private async getClipboard(): Promise<AgentTaskResult> {
    return {
      output: {
        text: "[Clipboard access requires native module]",
      },
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
    this.status = "idle";
  }

  getStatus(): AgentStatus {
    return this.status;
  }
}
