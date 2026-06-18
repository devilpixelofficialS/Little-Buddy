import { prisma } from "../client";
import type { Conversation, Message, Prisma } from "@prisma/client";

export class ConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({ where: { id } });
  }

  async findByUserId(userId: string, limit = 50): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.ConversationCreateInput): Promise<Conversation> {
    return prisma.conversation.create({ data });
  }

  async update(
    id: string,
    data: Prisma.ConversationUpdateInput
  ): Promise<Conversation> {
    return prisma.conversation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Conversation> {
    return prisma.conversation.delete({ where: { id } });
  }

  async findWithMessages(id: string): Promise<
    (Conversation & { messages: Message[] }) | null
  > {
    return prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  async createWithMessage(
    userId: string,
    title: string | null,
    firstMessage: string,
    role = "user"
  ): Promise<Conversation & { messages: Message[] }> {
    return prisma.conversation.create({
      data: {
        userId,
        title,
        messages: {
          create: { role, content: firstMessage },
        },
      },
      include: { messages: true },
    });
  }
}

export const conversationRepository = new ConversationRepository();
