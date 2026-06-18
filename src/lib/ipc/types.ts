export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  quitApp: () => Promise<void>;
  minimizeApp: () => Promise<void>;
  maximizeApp: () => Promise<void>;
  closeApp: () => Promise<void>;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VoiceStartPayload {
  model?: string;
  language?: string;
}

export interface AgentExecutePayload {
  agentName: string;
  task: string;
  params?: Record<string, unknown>;
}

export interface MemoryStorePayload {
  content: string;
  category: string;
  embeddingId?: string;
}

export interface SkillExecutePayload {
  skillId: string;
  params?: Record<string, unknown>;
}
