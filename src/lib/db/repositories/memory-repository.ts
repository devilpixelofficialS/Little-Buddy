import { prisma } from "../client";
import type { Memory, Prisma } from "@prisma/client";

export class MemoryRepository {
  async findById(id: string): Promise<Memory | null> {
    return prisma.memory.findUnique({ where: { id } });
  }

  async findByUserId(
    userId: string,
    category?: string,
    limit = 50
  ): Promise<Memory[]> {
    return prisma.memory.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByEmbeddingId(embeddingId: string): Promise<Memory | null> {
    return prisma.memory.findFirst({ where: { embeddingId } });
  }

  async create(data: Prisma.MemoryCreateInput): Promise<Memory> {
    return prisma.memory.create({ data });
  }

  async createMany(
    memories: Prisma.MemoryCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.memory.createMany({ data: memories });
  }

  async update(id: string, data: Prisma.MemoryUpdateInput): Promise<Memory> {
    return prisma.memory.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Memory> {
    return prisma.memory.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.memory.deleteMany({ where: { userId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.memory.count({ where: { userId } });
  }

  async searchByCategory(
    userId: string,
    category: string,
    limit = 20
  ): Promise<Memory[]> {
    return prisma.memory.findMany({
      where: { userId, category },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const memoryRepository = new MemoryRepository();
