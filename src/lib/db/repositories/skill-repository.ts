import { prisma } from "../client";
import type { Skill, SkillExecution, Prisma } from "@prisma/client";

export class SkillRepository {
  async findById(id: string): Promise<Skill | null> {
    return prisma.skill.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Skill | null> {
    return prisma.skill.findUnique({ where: { name } });
  }

  async findAll(): Promise<Skill[]> {
    return prisma.skill.findMany({ orderBy: { name: "asc" } });
  }

  async findEnabled(): Promise<Skill[]> {
    return prisma.skill.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
    });
  }

  async create(data: Prisma.SkillCreateInput): Promise<Skill> {
    return prisma.skill.create({ data });
  }

  async update(id: string, data: Prisma.SkillUpdateInput): Promise<Skill> {
    return prisma.skill.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Skill> {
    return prisma.skill.delete({ where: { id } });
  }

  async toggleEnabled(id: string): Promise<Skill> {
    const skill = await this.findById(id);
    if (!skill) throw new Error("Skill not found");

    return this.update(id, { enabled: !skill.enabled });
  }

  async createExecution(
    data: Prisma.SkillExecutionCreateInput
  ): Promise<SkillExecution> {
    return prisma.skillExecution.create({ data });
  }

  async updateExecution(
    id: string,
    data: Prisma.SkillExecutionUpdateInput
  ): Promise<SkillExecution> {
    return prisma.skillExecution.update({ where: { id }, data });
  }

  async getExecutions(
    skillId: string,
    limit = 50
  ): Promise<SkillExecution[]> {
    return prisma.skillExecution.findMany({
      where: { skillId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const skillRepository = new SkillRepository();
