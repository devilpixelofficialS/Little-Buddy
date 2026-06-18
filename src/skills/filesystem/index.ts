import { Skill, SkillManifest, SkillExecutionContext, SkillExecutionResult } from "../types";

export class ReadFileSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "filesystem:read-file",
    name: "Read File",
    description: "Reads the contents of a file",
    version: "1.0.0",
    author: "Little Buddy",
    category: "filesystem",
    permissions: ["filesystem:read"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { path } = params as { path: string };

    if (!path) {
      return {
        success: false,
        error: "path is required",
        duration: 0,
      };
    }

    const fs = require("fs").promises;

    try {
      const content = await fs.readFile(path, "utf-8");
      const stats = await fs.stat(path);

      return {
        success: true,
        output: {
          content,
          size: stats.size,
          modified: stats.mtime,
        },
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
    return typeof params.path === "string" && params.path.length > 0;
  }

  getHelp(): string {
    return "Reads a file. Parameters: { path: string }";
  }
}

export class WriteFileSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "filesystem:write-file",
    name: "Write File",
    description: "Writes content to a file",
    version: "1.0.0",
    author: "Little Buddy",
    category: "filesystem",
    permissions: ["filesystem:write"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { path, content } = params as { path: string; content: string };

    if (!path || content === undefined) {
      return {
        success: false,
        error: "path and content are required",
        duration: 0,
      };
    }

    const fs = require("fs").promises;
    const pathModule = require("path");

    try {
      const dir = pathModule.dirname(path);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(path, content, "utf-8");

      return {
        success: true,
        output: { path, written: true },
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
    return (
      typeof params.path === "string" &&
      params.path.length > 0 &&
      typeof params.content === "string"
    );
  }

  getHelp(): string {
    return "Writes a file. Parameters: { path: string, content: string }";
  }
}

export class ListDirectorySkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "filesystem:list-dir",
    name: "List Directory",
    description: "Lists contents of a directory",
    version: "1.0.0",
    author: "Little Buddy",
    category: "filesystem",
    permissions: ["filesystem:read"],
  };

  async execute(
    params: Record<string, unknown>,
    _context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const { path } = params as { path: string };

    if (!path) {
      return {
        success: false,
        error: "path is required",
        duration: 0,
      };
    }

    const fs = require("fs").promises;

    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      const items = entries.map(
        (entry: { name: string; isDirectory: () => boolean }) => ({
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
        })
      );

      return {
        success: true,
        output: { path, items },
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
    return typeof params.path === "string" && params.path.length > 0;
  }

  getHelp(): string {
    return "Lists a directory. Parameters: { path: string }";
  }
}
