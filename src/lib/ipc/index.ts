import { IPC_CHANNELS } from "./channels";

export const ipc = {
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
    window.electron?.invoke(channel, ...args) as Promise<unknown>,
  app: {
    getVersion: () => window.electron?.getAppVersion(),
    quit: () => window.electron?.quitApp(),
    minimize: () => window.electron?.minimizeApp(),
    maximize: () => window.electron?.maximizeApp(),
    close: () => window.electron?.closeApp(),
  },

  voice: {
    startListening: (model?: string) =>
      window.electron?.invoke(IPC_CHANNELS.VOICE.START_LISTENING, { model }),
    stopListening: () =>
      window.electron?.invoke(IPC_CHANNELS.VOICE.STOP_LISTENING),
    onTranscript: (callback: (transcript: string) => void) =>
      window.electron?.on(IPC_CHANNELS.VOICE.TRANSCRIPT, (data) =>
        callback(data as string)
      ),
  },

  agent: {
    execute: (agentName: string, task: string, params?: Record<string, unknown>) =>
      window.electron?.invoke(IPC_CHANNELS.AGENT.EXECUTE, {
        agentName,
        task,
        params,
      }),
    stop: () => window.electron?.invoke(IPC_CHANNELS.AGENT.STOP),
    onStatus: (callback: (status: string) => void) =>
      window.electron?.on(IPC_CHANNELS.AGENT.STATUS, (data) =>
        callback(data as string)
      ),
  },

  memory: {
    store: (content: string, category: string) =>
      window.electron?.invoke(IPC_CHANNELS.MEMORY.STORE, { content, category }),
    retrieve: (query: string) =>
      window.electron?.invoke(IPC_CHANNELS.MEMORY.RETRIEVE, { query }),
    search: (query: string, limit?: number) =>
      window.electron?.invoke(IPC_CHANNELS.MEMORY.SEARCH, { query, limit }),
  },

  skill: {
    execute: (skillId: string, params?: Record<string, unknown>) =>
      window.electron?.invoke(IPC_CHANNELS.SKILL.EXECUTE, { skillId, params }),
    list: () => window.electron?.invoke(IPC_CHANNELS.SKILL.LIST),
    install: (skillId: string) =>
      window.electron?.invoke(IPC_CHANNELS.SKILL.INSTALL, { skillId }),
  },

  system: {
    screenshot: () => window.electron?.invoke(IPC_CHANNELS.SYSTEM.SCREENSHOT),
    openApp: (appName: string) =>
      window.electron?.invoke(IPC_CHANNELS.SYSTEM.OPEN_APP, { appName }),
    terminal: (command: string) =>
      window.electron?.invoke(IPC_CHANNELS.SYSTEM.TERMINAL, { command }),
  },
};
