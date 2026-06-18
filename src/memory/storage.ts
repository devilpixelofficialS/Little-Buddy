import { ipc } from "@/lib/ipc";
import {
  MemoryEntry,
  MemoryCategory,
  MemoryStoreOptions,
  MemoryRetrieveOptions,
  MemorySearchResult,
} from "./types";

export class MemoryStorageService {
  private memories: Map<string, MemoryEntry> = new Map();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async store(
    content: string,
    options: MemoryStoreOptions
  ): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      content,
      category: options.category,
      metadata: options.metadata,
      importance: options.importance ?? 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessCount: 0,
    };

    try {
      await ipc.invoke("db:memories:store", this.userId, content, options.category);
      this.memories.set(entry.id, entry);
      return entry;
    } catch (error) {
      this.memories.set(entry.id, entry);
      return entry;
    }
  }

  async retrieve(id: string): Promise<MemoryEntry | null> {
    const cached = this.memories.get(id);
    if (cached) {
      cached.lastAccessedAt = new Date();
      cached.accessCount++;
      return cached;
    }

    try {
      const result = await ipc.invoke("db:memories:get", id);
      if (result) {
        const entry = result as MemoryEntry;
        entry.lastAccessedAt = new Date();
        entry.accessCount++;
        this.memories.set(id, entry);
        return entry;
      }
    } catch (error) {
      console.error("Failed to retrieve memory:", error);
    }

    return null;
  }

  async search(
    query: string,
    options: MemoryRetrieveOptions = {}
  ): Promise<MemorySearchResult[]> {
    const { category, limit = 10, minImportance = 0 } = options;

    try {
      const results = await ipc.invoke(
        "db:memories:list",
        this.userId,
        category
      );

      const memories = (results as MemoryEntry[]).filter(
        (m) => m.importance >= minImportance
      );

      const scored = memories.map((entry) => ({
        entry,
        score: this.calculateRelevanceScore(entry, query),
        relevance: this.calculateTextSimilarity(entry.content, query),
      }));

      scored.sort((a, b) => b.score - a.score);

      return scored.slice(0, limit);
    } catch (error) {
      console.error("Failed to search memories:", error);
      return [];
    }
  }

  private calculateRelevanceScore(entry: MemoryEntry, query: string): number {
    const textScore = this.calculateTextSimilarity(entry.content, query);
    const importanceWeight = entry.importance * 0.3;
    const recencyWeight = this.calculateRecencyScore(entry.createdAt) * 0.2;
    const accessWeight = Math.min(entry.accessCount / 10, 1) * 0.1;

    return textScore + importanceWeight + recencyWeight + accessWeight;
  }

  private calculateTextSimilarity(text: string, query: string): number {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(" ");

    let matchCount = 0;
    for (const word of queryWords) {
      if (textLower.includes(word)) {
        matchCount++;
      }
    }

    return queryWords.length > 0 ? matchCount / queryWords.length : 0;
  }

  private calculateRecencyScore(createdAt: Date): number {
    const now = new Date();
    const daysSinceCreation =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(0, 1 - daysSinceCreation / 30);
  }

  async delete(id: string): Promise<void> {
    this.memories.delete(id);
    try {
      await ipc.invoke("db:memories:delete", id);
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  }

  async list(category?: MemoryCategory): Promise<MemoryEntry[]> {
    try {
      const results = await ipc.invoke(
        "db:memories:list",
        this.userId,
        category
      );
      return results as MemoryEntry[];
    } catch (error) {
      console.error("Failed to list memories:", error);
      return [];
    }
  }

  clearCache(): void {
    this.memories.clear();
  }
}
