"use client";

import { useCallback, useRef, useState } from "react";
import { DesktopAutomationService } from "./service";
import { Point, ScreenSize, WindowInfo } from "./types";

interface UseDesktopAutomationReturn {
  isReady: boolean;
  error: Error | null;
  click: (x: number, y: number, button?: "left" | "right" | "middle") => Promise<void>;
  moveMouse: (x: number, y: number) => Promise<void>;
  typeText: (text: string) => Promise<void>;
  pressKey: (key: string) => Promise<void>;
  hotkey: (...keys: string[]) => Promise<void>;
  screenshot: () => Promise<Buffer | null>;
  getWindows: () => Promise<WindowInfo[]>;
  getClipboard: () => Promise<string>;
  setClipboard: (text: string) => Promise<void>;
}

export function useDesktopAutomation(): UseDesktopAutomationReturn {
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef(new DesktopAutomationService());

  const click = useCallback(
    async (x: number, y: number, button: "left" | "right" | "middle" = "left") => {
      try {
        setError(null);
        await serviceRef.current.click({ x, y }, button);
      } catch (err) {
        setError(err as Error);
      }
    },
    []
  );

  const moveMouse = useCallback(async (x: number, y: number) => {
    try {
      setError(null);
      await serviceRef.current.moveMouse({ x, y });
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const typeText = useCallback(async (text: string) => {
    try {
      setError(null);
      await serviceRef.current.typeText(text);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const pressKey = useCallback(async (key: string) => {
    try {
      setError(null);
      await serviceRef.current.pressKey(key);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const hotkey = useCallback(async (...keys: string[]) => {
    try {
      setError(null);
      await serviceRef.current.hotkey(...keys);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const screenshot = useCallback(async (): Promise<Buffer | null> => {
    try {
      setError(null);
      return await serviceRef.current.screenshot();
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, []);

  const getWindows = useCallback(async (): Promise<WindowInfo[]> => {
    try {
      setError(null);
      return await serviceRef.current.getWindows();
    } catch (err) {
      setError(err as Error);
      return [];
    }
  }, []);

  const getClipboard = useCallback(async (): Promise<string> => {
    try {
      setError(null);
      return await serviceRef.current.getClipboard();
    } catch (err) {
      setError(err as Error);
      return "";
    }
  }, []);

  const setClipboard = useCallback(async (text: string) => {
    try {
      setError(null);
      await serviceRef.current.setClipboard(text);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  return {
    isReady: true,
    error,
    click,
    moveMouse,
    typeText,
    pressKey,
    hotkey,
    screenshot,
    getWindows,
    getClipboard,
    setClipboard,
  };
}
