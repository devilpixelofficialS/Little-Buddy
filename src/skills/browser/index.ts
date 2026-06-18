import { Skill, SkillManifest, SkillExecutionContext, SkillExecutionResult } from "../types";

export class OpenWebsiteSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "browser:open-url",
    name: "Open Website",
    description: "Opens a website in the default browser",
    version: "1.0.0",
    author: "Little Buddy",
    category: "browser",
    permissions: ["network:read"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { url } = params as { url: string };

    if (!url) {
      return {
        success: false,
        error: "url is required",
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
          command = `start "" "${url}"`;
          break;
        case "darwin":
          command = `open "${url}"`;
          break;
        default:
          command = `xdg-open "${url}"`;
      }

      await execAsync(command, { timeout: 10000 });

      return {
        success: true,
        output: { url, opened: true },
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
    return typeof params.url === "string" && params.url.length > 0;
  }

  getHelp(): string {
    return "Opens a website. Parameters: { url: string }";
  }
}
