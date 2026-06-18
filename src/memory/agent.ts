import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentType,
} from "../agents/types";
import { MemoryStorageService } from "./storage";
import {
  MemoryEntry,
  MemoryCategory,
  MemoryStoreOptions,
  MemoryRetrieveOptions,
  MemorySearchResult,
  MemoryConsolidationResult,
} from "./types";

export class MemoryAgent implements Agent {
  readonly type: AgentType = "memory";
  readonly config: AgentConfig;

  private status: AgentStatus = "idle";
  private storage: MemoryStorageService;
  private consolidationInterval: ReturnType<typeof setInterval> | null = null;

  constructor(userId: string, config: Partial<AgentConfig> = {}) {
    this.config = {
      type: "memory",
      name: "Memory",
      description: "Stores memories, retrieves context, summarizes interactions",
      maxConcurrentTasks: 2,
      timeout: 10000,
      ...config,
    };

    this.storage = new MemoryStorageService(userId);
  }

  async initialize(): Promise<void> {
    this.status = "idle";
    this.startConsolidation();
  }

  async execute(task: AgentTask): Promise<AgentTaskResult> {
    this.status = "running";

    try {
      const { action, params } = task.input;

      switch (action) {
        case "memory:store":
          return await this.storeMemory(
            params.content as string,
            params.options as MemoryStoreOptions
          );
        case "memory:retrieve":
          return await this.retrieveMemory(params.id as string);
        case "memory:search":
          return await this.searchMemory(
            params.query as string,
            params.options as MemoryRetrieveOptions
          );
        case "memory:list":
          return await this.listMemories(
            params.category as MemoryCategory | undefined
          );
        case "memory:delete":
          return await this.deleteMemory(params.id as string);
        case "memory:consolidate":
          return await this.consolidateMemories();
        case "memory:summarize":
          return await this.summarizeInteraction(
            params.conversationId as string
          );
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      this.status = "error";
      throw error;
    } finally {
      this.status = "idle";
    }
  }

  private async storeMemory(
    content: string,
    options?: MemoryStoreOptions
  ): Promise<AgentTaskResult> {
    const storeOptions: MemoryStoreOptions = {
      category: options?.category ?? "fact",
      importance: options?.importance ?? 0.5,
      metadata: options?.metadata,
    };

    const entry = await this.storage.store(content, storeOptions);

    return {
      output: entry,
      metadata: {
        memoryId: entry.id,
        category: entry.category,
        importance: entry.importance,
      },
    };
  }

  private async retrieveMemory(id: string): Promise<AgentTaskResult> {
    const entry = await this.storage.retrieve(id);

    if (!entry) {
      throw new Error(`Memory ${id} not found`);
    }

    return {
      output: entry,
      metadata: {
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessedAt,
      },
    };
  }

  private async searchMemory(
    query: string,
    options?: MemoryRetrieveOptions
  ): Promise<AgentTaskResult> {
    const results = await this.storage.search(query, options);

    return {
      output: results,
      metadata: {
        query,
        resultCount: results.length,
        topScore: results.length > 0 ? results[0].score : 0,
      },
    };
  }

  private async listMemories(
    category?: MemoryCategory
  ): Promise<AgentTaskResult> {
    const memories = await this.storage.list(category);

    return {
      output: memories,
      metadata: {
        count: memories.length,
        category,
      },
    };
  }

  private async deleteMemory(id: string): Promise<AgentTaskResult> {
    await this.storage.delete(id);

    return {
      output: { deleted: true, id },
      metadata: { memoryId: id },
    };
  }

  private async consolidateMemories(): Promise<AgentTaskResult> {
    const result: MemoryConsolidationResult = {
      summarized: 0,
      archived: 0,
      deleted: 0,
    };

    try {
      const memories = await this.storage.list();
      const now = new Date();

      for (const memory of memories) {
        const daysSinceCreation =
          (now.getTime() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceCreation > 90 && memory.accessCount < 3) {
          result.archived++;
        }

        if (memory.importance < 0.2 && daysSinceCreation > 30) {
          result.deleted++;
          await this.storage.delete(memory.id);
        }
      }

      return {
        output: result,
        metadata: {
          totalMemories: memories.length,
          consolidatedAt: now.toISOString(),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private async summarizeInteraction(
    conversationId: string
  ): Promise<AgentTaskResult> {
    const searchResults = await this.storage.search(conversationId, {
      category: "conversation",
      limit: 50,
    });

    const memories = searchResults.map((r) => r.entry);

    const summary = {
      conversationId,
      memoryCount: memories.length,
      categories: [...new Set(memories.map((m) => m.category))],
      keyTopics: this.extractKeyTopics(memories),
      timestamp: new Date().toISOString(),
    };

    return {
      output: summary,
      metadata: {
        summarizedMemories: memories.length,
      },
    };
  }

  private extractKeyTopics(memories: MemoryEntry[]): string[] {
    const wordFrequency = new Map<string, number>();
    const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were"]);

    for (const memory of memories) {
      const words = memory.content.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      }
    }

    return Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private startConsolidation(): void {
    this.consolidationInterval = setInterval(
      () => {
        this.consolidateMemories().catch(console.error);
      },
      60 * 60 * 1000
    );
  }

  async pause(): Promise<void> {
    if (this.consolidationInterval) {
      clearInterval(this.consolidationInterval);
      this.consolidationInterval = null;
    }
    this.status = "paused";
  }

  async resume(): Promise<void> {
    this.startConsolidation();
    this.status = "idle";
  }

  async abort(): Promise<void> {
    if (this.consolidationInterval) {
      clearInterval(this.consolidationInterval);
      this.consolidationInterval = null;
    }
    this.status = "idle";
  }

  async destroy(): Promise<void> {
    await this.abort();
    this.storage.clearCache();
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getStorage(): MemoryStorageService {
    return this.storage;
  }
}
