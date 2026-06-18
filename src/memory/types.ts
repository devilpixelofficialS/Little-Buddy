export type MemoryCategory =
  | "conversation"
  | "preference"
  | "fact"
  | "task"
  | "context"
  | "learning";

export interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  category: MemoryCategory;
  metadata?: Record<string, unknown>;
  embeddingId?: string;
  importance: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  accessCount: number;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score: number;
  relevance: number;
}

export interface MemoryStoreOptions {
  category: MemoryCategory;
  importance?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryRetrieveOptions {
  category?: MemoryCategory;
  limit?: number;
  minImportance?: number;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface MemoryConsolidationResult {
  summarized: number;
  archived: number;
  deleted: number;
}

export interface MemoryCallbacks {
  onMemoryStored?: (entry: MemoryEntry) => void;
  onMemoryRetrieved?: (entries: MemoryEntry[]) => void;
  onConsolidationComplete?: (result: MemoryConsolidationResult) => void;
  onError?: (error: Error) => void;
}
