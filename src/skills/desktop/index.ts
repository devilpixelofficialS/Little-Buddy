import { Skill, SkillManifest, SkillExecutionContext, SkillExecutionResult } from "../types";

export class OpenApplicationSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "desktop:open-app",
    name: "Open Application",
    description: "Opens an application on the desktop",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { appName } = params as { appName: string };

    if (!appName) {
      return {
        success: false,
        error: "appName is required",
        duration: 0,
      };
    }

    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    try {
      let command: string;

      switch (process.platform) {
        case "win32":
          command = `start "" "${appName}"`;
          break;
        case "darwin":
          command = `open -a "${appName}"`;
          break;
        default:
          command = appName;
      }

      await execAsync(command, { timeout: 10000 });

      return {
        success: true,
        output: { appName, launched: true },
        duration: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: 0,
      };
    }
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.appName === "string" && params.appName.length > 0;
  }

  getHelp(): string {
    return "Opens an application. Parameters: { appName: string }";
  }
}

export class TerminalCommandSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "desktop:terminal",
    name: "Terminal Command",
    description: "Executes a terminal command",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { command } = params as { command: string };

    if (!command) {
      return {
        success: false,
        error: "command is required",
        duration: 0,
      };
    }

    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });

      return {
        success: true,
        output: { stdout, stderr },
        duration: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: 0,
      };
    }
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.command === "string" && params.command.length > 0;
  }

  getHelp(): string {
    return "Executes a terminal command. Parameters: { command: string }";
  }
}
