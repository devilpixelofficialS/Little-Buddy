export const IPC_CHANNELS = {
  APP: {
    VERSION: "app:version",
    QUIT: "app:quit",
    MINIMIZE: "app:minimize",
    MAXIMIZE: "app:maximize",
    CLOSE: "app:close",
  },
  VOICE: {
    START_LISTENING: "voice:start-listening",
    STOP_LISTENING: "voice:stop-listening",
    AUDIO_DATA: "voice:audio-data",
    TRANSCRIPT: "voice:transcript",
  },
  AGENT: {
    EXECUTE: "agent:execute",
    STATUS: "agent:status",
    STOP: "agent:stop",
  },
  MEMORY: {
    STORE: "memory:store",
    RETRIEVE: "memory:retrieve",
    SEARCH: "memory:search",
  },
  SKILL: {
    EXECUTE: "skill:execute",
    LIST: "skill:list",
    INSTALL: "skill:install",
  },
  SYSTEM: {
    SCREENSHOT: "system:screenshot",
    OPEN_APP: "system:open-app",
    TERMINAL: "system:terminal",
  },
} as const;

export type IPCChannel = typeof IPC_CHANNELS;
export type IPCChannelGroup = keyof IPCChannel;
