import { prisma } from "../client";
import type { AgentExecution, Prisma } from "@prisma/client";

export class AgentExecutionRepository {
  async findById(id: string): Promise<AgentExecution | null> {
    return prisma.agentExecution.findUnique({ where: { id } });
  }

  async findByAgentName(
    agentName: string,
    limit = 50
  ): Promise<AgentExecution[]> {
    return prisma.agentExecution.findMany({
      where: { agentName },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByStatus(
    status: string,
    limit = 50
  ): Promise<AgentExecution[]> {
    return prisma.agentExecution.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.AgentExecutionCreateInput): Promise<AgentExecution> {
    return prisma.agentExecution.create({ data });
  }

  async update(
    id: string,
    data: Prisma.AgentExecutionUpdateInput
  ): Promise<AgentExecution> {
    return prisma.agentExecution.update({ where: { id }, data });
  }

  async delete(id: string): Promise<AgentExecution> {
    return prisma.agentExecution.delete({ where: { id } });
  }

  async markRunning(id: string): Promise<AgentExecution> {
    return this.update(id, { status: "running" });
  }

  async markCompleted(id: string, output?: Prisma.InputJsonValue): Promise<AgentExecution> {
    return this.update(id, { status: "completed", output });
  }

  async markFailed(id: string, error: string): Promise<AgentExecution> {
    return this.update(id, { status: "failed", error });
  }

  async getRecentExecutions(limit = 20): Promise<AgentExecution[]> {
    return prisma.agentExecution.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const agentExecutionRepository = new AgentExecutionRepository();
