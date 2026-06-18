import { prisma } from "../client";
import type { Message, Prisma } from "@prisma/client";

export class MessageRepository {
  async findById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({ where: { id } });
  }

  async findByConversationId(
    conversationId: string,
    limit = 100
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  }

  async createMany(
    messages: Prisma.MessageCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.message.createMany({ data: messages });
  }

  async update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
    return prisma.message.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Message> {
    return prisma.message.delete({ where: { id } });
  }

  async deleteByConversationId(conversationId: string): Promise<Prisma.BatchPayload> {
    return prisma.message.deleteMany({ where: { conversationId } });
  }

  async countByConversationId(conversationId: string): Promise<number> {
    return prisma.message.count({ where: { conversationId } });
  }
}

export const messageRepository = new MessageRepository();
