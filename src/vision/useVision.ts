"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  VisionState,
  ScreenCaptureResult,
  ScreenAnalysisResult,
  ScreenInfo,
  FindElementOptions,
  FindElementResult,
  ReadTextOptions,
  ReadTextResult,
  ScreenRegion,
} from "./types";

export function useVision() {
  const [state, setState] = useState<VisionState>({
    isCapturing: false,
    isAnalyzing: false,
    captureHistory: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const captureScreen = useCallback(async (region?: ScreenRegion): Promise<ScreenCaptureResult | null> => {
    setState((prev) => ({ ...prev, isCapturing: true, error: undefined }));

    try {
      const result = await window.electron?.invoke("vision:capture-screen", { region });
      const capture = result as ScreenCaptureResult;

      setState((prev) => ({
        ...prev,
        isCapturing: false,
        lastCapture: capture,
        captureHistory: [...prev.captureHistory.slice(-49), capture],
      }));

      return capture;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Capture failed";
      setState((prev) => ({ ...prev, isCapturing: false, error: errorMessage }));
      return null;
    }
  }, []);

  const analyzeScreen = useCallback(async (): Promise<ScreenAnalysisResult | null> => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: undefined }));

    try {
      const result = await window.electron?.invoke("vision:analyze-screen");
      const analysis = result as ScreenAnalysisResult;

      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        lastAnalysis: analysis,
      }));

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Analysis failed";
      setState((prev) => ({ ...prev, isAnalyzing: false, error: errorMessage }));
      return null;
    }
  }, []);

  const findElement = useCallback(async (options: FindElementOptions): Promise<FindElementResult | null> => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: undefined }));

    try {
      const result = await window.electron?.invoke("vision:find-element", options);
      const findResult = result as FindElementResult;

      setState((prev) => ({ ...prev, isAnalyzing: false }));
      return findResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Find element failed";
      setState((prev) => ({ ...prev, isAnalyzing: false, error: errorMessage }));
      return null;
    }
  }, []);

  const readText = useCallback(async (options?: ReadTextOptions): Promise<ReadTextResult | null> => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: undefined }));

    try {
      const result = await window.electron?.invoke("vision:read-text", options);
      const textResult = result as ReadTextResult;

      setState((prev) => ({ ...prev, isAnalyzing: false }));
      return textResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Read text failed";
      setState((prev) => ({ ...prev, isAnalyzing: false, error: errorMessage }));
      return null;
    }
  }, []);

  const getScreenInfo = useCallback(async (): Promise<ScreenInfo | null> => {
    try {
      const result = await window.electron?.invoke("vision:screen-info");
      return result as ScreenInfo;
    } catch (error) {
      console.error("Failed to get screen info:", error);
      return null;
    }
  }, []);

  const clickAt = useCallback(async (x: number, y: number): Promise<void> => {
    try {
      await window.electron?.invoke("vision:click", { x, y });
    } catch (error) {
      console.error("Click failed:", error);
      throw error;
    }
  }, []);

  const typeText = useCallback(async (text: string): Promise<void> => {
    try {
      await window.electron?.invoke("vision:type-text", { text });
    } catch (error) {
      console.error("Type text failed:", error);
      throw error;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, captureHistory: [] }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  useEffect(() => {
    return () => {
      if (stateRef.current.isCapturing || stateRef.current.isAnalyzing) {
        console.log("Cleaning up vision operations");
      }
    };
  }, []);

  return {
    ...state,
    captureScreen,
    analyzeScreen,
    findElement,
    readText,
    getScreenInfo,
    clickAt,
    typeText,
    clearHistory,
    clearError,
  };
}
