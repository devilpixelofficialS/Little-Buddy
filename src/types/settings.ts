export interface VoiceSettings {
  enabled: boolean;
  wakeWordEnabled: boolean;
  wakeWord: string;
  ttsVoice: string;
  ttsSpeed: number;
  ttsPitch: number;
  sttModel: string;
  language: string;
  autoStartListening: boolean;
  silenceTimeout: number;
}

export interface MemorySettings {
  enabled: boolean;
  maxMemories: number;
  retentionDays: number;
  autoConsolidate: boolean;
  consolidationInterval: number;
  categories: MemoryCategory[];
}

export interface MemoryCategory {
  id: string;
  name: string;
  enabled: boolean;
  maxItems: number;
}

export interface SkillPermission {
  skillId: string;
  skillName: string;
  permission: string;
  granted: boolean;
  lastUsed?: Date;
}

export interface AISettings {
  provider: "openai" | "anthropic" | "local";
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableStreaming: boolean;
}

export interface GeneralSettings {
  theme: "dark" | "light" | "system";
  startMinimized: boolean;
  launchAtStartup: boolean;
  enableNotifications: boolean;
  enableSounds: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface AppSettings {
  voice: VoiceSettings;
  memory: MemorySettings;
  skills: SkillPermission[];
  ai: AISettings;
  general: GeneralSettings;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  wakeWordEnabled: true,
  wakeWord: "hey buddy",
  ttsVoice: "af_heart",
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  sttModel: "base",
  language: "en",
  autoStartListening: true,
  silenceTimeout: 5000,
};

export const DEFAULT_MEMORY_SETTINGS: MemorySettings = {
  enabled: true,
  maxMemories: 10000,
  retentionDays: 90,
  autoConsolidate: true,
  consolidationInterval: 3600000,
  categories: [
    { id: "general", name: "General", enabled: true, maxItems: 5000 },
    { id: "conversations", name: "Conversations", enabled: true, maxItems: 2000 },
    { id: "preferences", name: "Preferences", enabled: true, maxItems: 500 },
    { id: "tasks", name: "Tasks", enabled: true, maxItems: 1000 },
  ],
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "You are Little Buddy, a helpful AI desktop assistant.",
  enableStreaming: true,
};

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  theme: "dark",
  startMinimized: false,
  launchAtStartup: false,
  enableNotifications: true,
  enableSounds: true,
  logLevel: "info",
};

export const DEFAULT_SETTINGS: AppSettings = {
  voice: DEFAULT_VOICE_SETTINGS,
  memory: DEFAULT_MEMORY_SETTINGS,
  skills: [],
  ai: DEFAULT_AI_SETTINGS,
  general: DEFAULT_GENERAL_SETTINGS,
};
