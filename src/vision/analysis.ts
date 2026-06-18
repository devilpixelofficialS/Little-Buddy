import {
  ScreenAnalysisResult,
  ScreenElement,
  FindElementOptions,
  FindElementResult,
  ReadTextOptions,
  ReadTextResult,
  TextBlock,
  ScreenCaptureResult,
  ScreenRegion,
} from "./types";
import { ScreenCaptureService } from "./capture";

export class ScreenAnalysisService {
  private captureService: ScreenCaptureService;

  constructor(captureService: ScreenCaptureService) {
    this.captureService = captureService;
  }

  async analyzeScreen(capture?: ScreenCaptureResult): Promise<ScreenAnalysisResult> {
    const screenshot = capture || (await this.captureService.captureScreen());

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("vision:analyze-screen", {
          imageData: screenshot.imageData,
          width: screenshot.width,
          height: screenshot.height,
        });
        return result as ScreenAnalysisResult;
      }

      return this.simulateAnalysis(screenshot);
    } catch (error) {
      console.error("Screen analysis failed:", error);
      throw error;
    }
  }

  async findElement(options: FindElementOptions): Promise<FindElementResult> {
    const capture = await this.captureService.captureScreen();

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("vision:find-element", {
          ...options,
          imageData: capture.imageData,
        });
        return result as FindElementResult;
      }

      return this.simulateFindElement(options, capture);
    } catch (error) {
      console.error("Element search failed:", error);
      throw error;
    }
  }

  async readText(options: ReadTextOptions = {}): Promise<ReadTextResult> {
    const capture = await this.captureService.captureScreen({
      region: options.region,
    });

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("vision:read-text", {
          imageData: capture.imageData,
          language: options.language,
          enhanceContrast: options.enhanceContrast,
        });
        return result as ReadTextResult;
      }

      return this.simulateReadText(capture);
    } catch (error) {
      console.error("Text recognition failed:", error);
      throw error;
    }
  }

  async findAndClick(options: FindElementOptions): Promise<boolean> {
    const result = await this.findElement(options);
    if (result.found && result.element) {
      const center = this.getElementCenter(result.element.bounds);
      await this.clickAt(center.x, center.y);
      return true;
    }
    return false;
  }

  async clickAt(x: number, y: number): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.electron) {
        await window.electron.invoke("vision:click", { x, y });
        return;
      }

      console.log(`Click at (${x}, ${y}) - simulation mode`);
    } catch (error) {
      console.error("Click failed:", error);
      throw error;
    }
  }

  async typeText(text: string): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.electron) {
        await window.electron.invoke("vision:type-text", { text });
        return;
      }

      console.log(`Type text: "${text}" - simulation mode`);
    } catch (error) {
      console.error("Type text failed:", error);
      throw error;
    }
  }

  private getElementCenter(bounds: ScreenRegion): { x: number; y: number } {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  private simulateAnalysis(capture: ScreenCaptureResult): ScreenAnalysisResult {
    const elements: ScreenElement[] = [
      {
        type: "window",
        label: "Application Window",
        bounds: { x: 0, y: 0, width: capture.width, height: capture.height },
        confidence: 0.95,
      },
      {
        type: "button",
        label: "Close Button",
        bounds: { x: capture.width - 50, y: 10, width: 40, height: 40 },
        confidence: 0.85,
      },
      {
        type: "text",
        label: "Title Bar",
        bounds: { x: 100, y: 10, width: 200, height: 30 },
        confidence: 0.9,
      },
    ];

    return {
      description: `Screen capture with ${elements.length} detected elements. Primary application window is visible with standard controls.`,
      elements,
      textContent: ["Application Window", "Menu Bar", "Content Area"],
      timestamp: new Date(),
    };
  }

  private simulateFindElement(
    options: FindElementOptions,
    capture: ScreenCaptureResult
  ): FindElementResult {
    const mockElement: ScreenElement = {
      type: options.type || "button",
      label: options.label || "Found Element",
      bounds: { x: 100, y: 100, width: 120, height: 40 },
      confidence: 0.88,
    };

    return {
      found: true,
      element: mockElement,
      screenshot: capture,
    };
  }

  private simulateReadText(capture: ScreenCaptureResult): ReadTextResult {
    const blocks: TextBlock[] = [
      {
        text: "Sample detected text from screen",
        bounds: { x: 50, y: 50, width: 300, height: 30 },
        confidence: 0.92,
        lines: ["Sample detected text from screen"],
      },
      {
        text: "Another text block",
        bounds: { x: 50, y: 100, width: 200, height: 30 },
        confidence: 0.88,
        lines: ["Another text block"],
      },
    ];

    return {
      text: blocks.map((b) => b.text).join("\n"),
      blocks,
      confidence: 0.9,
      screenshot: capture,
    };
  }
}

export function createAnalysisService(
  captureService: ScreenCaptureService
): ScreenAnalysisService {
  return new ScreenAnalysisService(captureService);
}
