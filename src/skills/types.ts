export type SkillCategory =
  | "desktop"
  | "browser"
  | "filesystem"
  | "coding"
  | "research"
  | "communication"
  | "productivity";

export type SkillPermission =
  | "filesystem:read"
  | "filesystem:write"
  | "network:read"
  | "network:write"
  | "system:execute"
  | "system:admin"
  | "browser:control"
  | "clipboard:read"
  | "clipboard:write";

export interface SkillManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: SkillCategory;
  permissions: SkillPermission[];
  dependencies?: string[];
  config?: Record<string, unknown>;
}

export interface SkillExecutionContext {
  userId?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
}

export interface SkillExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface Skill {
  readonly manifest: SkillManifest;
  execute(
    params: Record<string, unknown>,
    context?: SkillExecutionContext
  ): Promise<SkillExecutionResult>;
  validate?(params: Record<string, unknown>): boolean;
  getHelp?(): string;
}

export interface SkillRegistration {
  skill: Skill;
  registeredAt: Date;
  executionCount: number;
  lastExecutedAt?: Date;
}

export interface SkillExecutionLog {
  id: string;
  skillId: string;
  params: Record<string, unknown>;
  result: SkillExecutionResult;
  executedAt: Date;
}
