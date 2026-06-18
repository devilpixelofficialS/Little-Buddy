import {
  ScreenCaptureOptions,
  ScreenCaptureResult,
  ScreenInfo,
  ScreenRegion,
  DisplayInfo,
  CursorPosition,
} from "./types";

export class ScreenCaptureService {
  private captureHistory: ScreenCaptureResult[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  async captureScreen(options: ScreenCaptureOptions = {}): Promise<ScreenCaptureResult> {
    const {
      format = "png",
      quality = 90,
      displayId = 0,
    } = options;

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke(
          "vision:capture-screen",
          { format, quality, displayId, region: options.region }
        );
        const capture = result as ScreenCaptureResult;
        this.addToHistory(capture);
        return capture;
      }

      return this.simulateCapture(format, displayId);
    } catch (error) {
      console.error("Screen capture failed:", error);
      throw error;
    }
  }

  async captureRegion(region: ScreenRegion): Promise<ScreenCaptureResult> {
    return this.captureScreen({ region });
  }

  async getScreenInfo(): Promise<ScreenInfo> {
    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("vision:screen-info");
        return result as ScreenInfo;
      }

      return this.simulateScreenInfo();
    } catch (error) {
      console.error("Failed to get screen info:", error);
      throw error;
    }
  }

  async getCursorPosition(): Promise<CursorPosition> {
    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("vision:cursor-position");
        return result as CursorPosition;
      }

      return { x: 0, y: 0 };
    } catch (error) {
      console.error("Failed to get cursor position:", error);
      throw error;
    }
  }

  getCaptureHistory(): ScreenCaptureResult[] {
    return [...this.captureHistory];
  }

  getLatestCapture(): ScreenCaptureResult | undefined {
    return this.captureHistory[this.captureHistory.length - 1];
  }

  clearHistory(): void {
    this.captureHistory = [];
  }

  private addToHistory(capture: ScreenCaptureResult): void {
    this.captureHistory.push(capture);
    if (this.captureHistory.length > this.maxHistory) {
      this.captureHistory.shift();
    }
  }

  private simulateCapture(format: string, displayId: number): ScreenCaptureResult {
    const capture: ScreenCaptureResult = {
      id: `capture_${Date.now()}`,
      imageData: this.createPlaceholderImage(),
      width: 1920,
      height: 1080,
      timestamp: new Date(),
      format,
      displayId,
    };
    this.addToHistory(capture);
    return capture;
  }

  private simulateScreenInfo(): ScreenInfo {
    const primaryDisplay: DisplayInfo = {
      id: 0,
      name: "Primary Display",
      width: 1920,
      height: 1080,
      x: 0,
      y: 0,
      isPrimary: true,
      scaleFactor: 1,
    };

    return {
      displays: [primaryDisplay],
      primaryDisplay,
      cursorPosition: { x: 960, y: 540 },
    };
  }

  private createPlaceholderImage(): string {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }
}

export const screenCaptureService = new ScreenCaptureService();
