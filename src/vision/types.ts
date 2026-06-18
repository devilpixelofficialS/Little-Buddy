export type VisionAction =
  | "capture_screen"
  | "capture_region"
  | "analyze_screen"
  | "find_element"
  | "read_text"
  | "get_screen_info";

export interface ScreenCaptureOptions {
  region?: ScreenRegion;
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  displayId?: number;
}

export interface ScreenRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenCaptureResult {
  id: string;
  imageData: string;
  width: number;
  height: number;
  timestamp: Date;
  format: string;
  displayId: number;
}

export interface ScreenInfo {
  displays: DisplayInfo[];
  primaryDisplay: DisplayInfo;
  cursorPosition: CursorPosition;
}

export interface DisplayInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isPrimary: boolean;
  scaleFactor: number;
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface ScreenAnalysisResult {
  description: string;
  elements: ScreenElement[];
  textContent: string[];
  timestamp: Date;
}

export interface ScreenElement {
  type: "button" | "text" | "input" | "link" | "icon" | "image" | "menu" | "window" | "unknown";
  label?: string;
  bounds: ScreenRegion;
  confidence: number;
  attributes?: Record<string, string>;
}

export interface FindElementOptions {
  type?: ScreenElement["type"];
  label?: string;
  text?: string;
  region?: ScreenRegion;
  timeout?: number;
}

export interface FindElementResult {
  found: boolean;
  element?: ScreenElement;
  alternatives?: ScreenElement[];
  screenshot?: ScreenCaptureResult;
}

export interface ReadTextOptions {
  region?: ScreenRegion;
  language?: string;
  enhanceContrast?: boolean;
}

export interface ReadTextResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
  screenshot?: ScreenCaptureResult;
}

export interface TextBlock {
  text: string;
  bounds: ScreenRegion;
  confidence: number;
  lines: string[];
}

export interface VisionConfig {
  autoCaptureOnAction: boolean;
  captureFormat: "png" | "jpeg" | "webp";
  captureQuality: number;
  maxCaptureHistory: number;
  analysisEndpoint?: string;
  ocrEnabled: boolean;
  elementDetectionEnabled: boolean;
}

export const DEFAULT_VISION_CONFIG: VisionConfig = {
  autoCaptureOnAction: true,
  captureFormat: "png",
  captureQuality: 90,
  maxCaptureHistory: 50,
  ocrEnabled: true,
  elementDetectionEnabled: true,
};

export interface VisionState {
  isCapturing: boolean;
  isAnalyzing: boolean;
  lastCapture?: ScreenCaptureResult;
  lastAnalysis?: ScreenAnalysisResult;
  captureHistory: ScreenCaptureResult[];
  error?: string;
}
