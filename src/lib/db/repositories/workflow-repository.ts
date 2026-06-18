import { prisma } from "../client";
import type { Workflow, WorkflowExecution, Prisma } from "@prisma/client";

export class WorkflowRepository {
  async findById(id: string): Promise<Workflow | null> {
    return prisma.workflow.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Workflow[]> {
    return prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.WorkflowCreateInput): Promise<Workflow> {
    return prisma.workflow.create({ data });
  }

  async update(id: string, data: Prisma.WorkflowUpdateInput): Promise<Workflow> {
    return prisma.workflow.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Workflow> {
    return prisma.workflow.delete({ where: { id } });
  }

  async toggleEnabled(id: string): Promise<Workflow> {
    const workflow = await this.findById(id);
    if (!workflow) throw new Error("Workflow not found");

    return this.update(id, { enabled: !workflow.enabled });
  }

  async createExecution(
    data: Prisma.WorkflowExecutionCreateInput
  ): Promise<WorkflowExecution> {
    return prisma.workflowExecution.create({ data });
  }

  async updateExecution(
    id: string,
    data: Prisma.WorkflowExecutionUpdateInput
  ): Promise<WorkflowExecution> {
    return prisma.workflowExecution.update({ where: { id }, data });
  }

  async getExecutions(
    workflowId: string,
    limit = 50
  ): Promise<WorkflowExecution[]> {
    return prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { startedAt: "desc" },
      take: limit,
    });
  }
}

export const workflowRepository = new WorkflowRepository();
