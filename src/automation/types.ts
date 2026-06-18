export type MouseButton = "left" | "right" | "middle";

export interface Point {
  x: number;
  y: number;
}

export interface ScreenSize {
  width: number;
  height: number;
}

export interface WindowInfo {
  id: string;
  title: string;
  processName: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isActive: boolean;
}

export interface DesktopAutomationConfig {
  mouseSpeed: number;
  keyboardDelay: number;
  screenshotQuality: number;
}

export interface ScreenshotOptions {
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  format?: "png" | "jpeg";
  quality?: number;
}

export interface AutomationCallbacks {
  onAction?: (action: string) => void;
  onError?: (error: Error) => void;
}

export const DEFAULT_AUTOMATION_CONFIG: DesktopAutomationConfig = {
  mouseSpeed: 10,
  keyboardDelay: 50,
  screenshotQuality: 80,
};
