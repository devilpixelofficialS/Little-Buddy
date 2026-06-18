import {
  Skill,
  SkillManifest,
  SkillRegistration,
  SkillExecutionLog,
  SkillExecutionContext,
  SkillExecutionResult,
  SkillCategory,
} from "./types";

export class SkillRegistry {
  private skills: Map<string, SkillRegistration> = new Map();
  private executionLogs: SkillExecutionLog[] = [];
  private maxLogs = 1000;

  register(skill: Skill): void {
    const { id } = skill.manifest;

    if (this.skills.has(id)) {
      throw new Error(`Skill ${id} is already registered`);
    }

    this.skills.set(id, {
      skill,
      registeredAt: new Date(),
      executionCount: 0,
    });
  }

  unregister(id: string): boolean {
    return this.skills.delete(id);
  }

  get(id: string): Skill | undefined {
    return this.skills.get(id)?.skill;
  }

  getRegistration(id: string): SkillRegistration | undefined {
    return this.skills.get(id);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values()).map((reg) => reg.skill);
  }

  getByCategory(category: SkillCategory): Skill[] {
    return this.getAll().filter((s) => s.manifest.category === category);
  }

  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (s) =>
        s.manifest.name.toLowerCase().includes(lowerQuery) ||
        s.manifest.description.toLowerCase().includes(lowerQuery)
    );
  }

  async execute(
    skillId: string,
    params: Record<string, unknown>,
    context?: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const registration = this.skills.get(skillId);

    if (!registration) {
      throw new Error(`Skill ${skillId} not found`);
    }

    const { skill } = registration;

    if (skill.validate && !skill.validate(params)) {
      return {
        success: false,
        error: "Invalid parameters",
        duration: 0,
      };
    }

    const startTime = Date.now();

    try {
      const result = await skill.execute(params, context);
      const duration = Date.now() - startTime;

      registration.executionCount++;
      registration.lastExecutedAt = new Date();

      const log: SkillExecutionLog = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        skillId,
        params,
        result: { ...result, duration },
        executedAt: new Date(),
      };

      this.executionLogs.push(log);
      if (this.executionLogs.length > this.maxLogs) {
        this.executionLogs.shift();
      }

      return { ...result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      const log: SkillExecutionLog = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        skillId,
        params,
        result: {
          success: false,
          error: errorMessage,
          duration,
        },
        executedAt: new Date(),
      };

      this.executionLogs.push(log);

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  getExecutionLogs(skillId?: string, limit = 50): SkillExecutionLog[] {
    let logs = this.executionLogs;
    if (skillId) {
      logs = logs.filter((l) => l.skillId === skillId);
    }
    return logs.slice(-limit);
  }

  getStats(): {
    totalSkills: number;
    totalExecutions: number;
    topSkills: Array<{ id: string; name: string; executions: number }>;
  } {
    const registrations = Array.from(this.skills.values());
    const totalExecutions = registrations.reduce(
      (sum, reg) => sum + reg.executionCount,
      0
    );

    const topSkills = registrations
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 10)
      .map((reg) => ({
        id: reg.skill.manifest.id,
        name: reg.skill.manifest.name,
        executions: reg.executionCount,
      }));

    return {
      totalSkills: this.skills.size,
      totalExecutions,
      topSkills,
    };
  }
}
