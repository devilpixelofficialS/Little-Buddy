import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  quitApp: () => Promise<void>;
  minimizeApp: () => Promise<void>;
  maximizeApp: () => Promise<void>;
  closeApp: () => Promise<void>;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke("app:version"),
  quitApp: () => ipcRenderer.invoke("app:quit"),
  minimizeApp: () => ipcRenderer.invoke("app:minimize"),
  maximizeApp: () => ipcRenderer.invoke("app:maximize"),
  closeApp: () => ipcRenderer.invoke("app:close"),

  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
};

contextBridge.exposeInMainWorld("electron", electronAPI);
