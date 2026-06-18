"use client";

import { useCallback, useEffect, useState } from "react";
import { ipc } from "@/lib/ipc";

export function useIPC() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(typeof window !== "undefined" && !!window.electron);
  }, []);

  const invoke = useCallback(
    async <T>(channel: string, ...args: unknown[]): Promise<T | undefined> => {
      if (!window.electron) {
        console.warn("Electron API not available");
        return undefined;
      }
      return window.electron.invoke(channel, ...args) as Promise<T>;
    },
    []
  );

  const on = useCallback(
    (channel: string, callback: (...args: unknown[]) => void) => {
      if (!window.electron) {
        return () => {};
      }
      return window.electron.on(channel, callback);
    },
    []
  );

  return { isAvailable, invoke, on, ipc };
}

export function useAppVersion() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    window.electron?.getAppVersion().then(setVersion);
  }, []);

  return version;
}

export function useWindowState() {
  const { ipc: ipcClient } = useIPC();

  const minimize = useCallback(() => {
    ipcClient.app.minimize();
  }, [ipcClient]);

  const maximize = useCallback(() => {
    ipcClient.app.maximize();
  }, [ipcClient]);

  const close = useCallback(() => {
    ipcClient.app.close();
  }, [ipcClient]);

  return { minimize, maximize, close };
}
