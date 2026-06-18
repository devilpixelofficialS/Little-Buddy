import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
} from "../agents/types";
import {
  VisionConfig,
  VisionAction,
  DEFAULT_VISION_CONFIG,
  ScreenCaptureResult,
  ScreenAnalysisResult,
} from "./types";
import { ScreenCaptureService } from "./capture";
import { ScreenAnalysisService } from "./analysis";

const VISION_AGENT_CONFIG: AgentConfig = {
  type: "context",
  name: "Vision Agent",
  description: "Handles screen capture, analysis, and visual understanding",
  maxConcurrentTasks: 2,
  timeout: 15000,
};

export class VisionAgent implements Agent {
  readonly type = "context" as const;
  readonly config = VISION_AGENT_CONFIG;

  private status: AgentStatus = "idle";
  private captureService: ScreenCaptureService;
  private analysisService: ScreenAnalysisService;
  private visionConfig: VisionConfig;
  private lastCapture?: ScreenCaptureResult;
  private lastAnalysis?: ScreenAnalysisResult;

  constructor(config: Partial<VisionConfig> = {}) {
    this.visionConfig = { ...DEFAULT_VISION_CONFIG, ...config };
    this.captureService = new ScreenCaptureService(
      this.visionConfig.maxCaptureHistory
    );
    this.analysisService = new ScreenAnalysisService(this.captureService);
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "idle";
    console.log("Vision Agent initialized");
  }

  async execute(task: AgentTask): Promise<AgentTaskResult> {
    this.status = "running";

    try {
      const action = task.input.action as VisionAction;
      const params = task.input.params;

      let output: unknown;

      switch (action) {
        case "capture_screen":
          output = await this.captureScreen(params as { region?: { x: number; y: number; width: number; height: number } });
          break;

        case "capture_region":
          output = await this.captureRegion(params as { x: number; y: number; width: number; height: number });
          break;

        case "analyze_screen":
          output = await this.analyzeScreen();
          break;

        case "find_element":
          output = await this.findElement(params as { type?: string; label?: string; text?: string });
          break;

        case "read_text":
          output = await this.readText(params as { language?: string });
          break;

        case "get_screen_info":
          output = await this.getScreenInfo();
          break;

        default:
          throw new Error(`Unknown vision action: ${action}`);
      }

      this.status = "completed";

      return {
        output,
        metadata: {
          action,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.status = "failed";
      throw error;
    }
  }

  async pause(): Promise<void> {
    this.status = "paused";
  }

  async resume(): Promise<void> {
    this.status = "idle";
  }

  async abort(): Promise<void> {
    this.status = "idle";
  }

  async destroy(): Promise<void> {
    this.captureService.clearHistory();
    this.status = "idle";
  }

  private async captureScreen(params: { region?: { x: number; y: number; width: number; height: number } }): Promise<ScreenCaptureResult> {
    const capture = await this.captureService.captureScreen({
      region: params.region,
      format: this.visionConfig.captureFormat,
      quality: this.visionConfig.captureQuality,
    });
    this.lastCapture = capture;
    return capture;
  }

  private async captureRegion(region: { x: number; y: number; width: number; height: number }): Promise<ScreenCaptureResult> {
    const capture = await this.captureService.captureRegion(region);
    this.lastCapture = capture;
    return capture;
  }

  private async analyzeScreen(): Promise<ScreenAnalysisResult> {
    const analysis = await this.analysisService.analyzeScreen(this.lastCapture);
    this.lastAnalysis = analysis;
    return analysis;
  }

  private async findElement(params: { type?: string; label?: string; text?: string }) {
    return this.analysisService.findElement({
      type: params.type as "button" | "text" | "input" | "link" | "icon" | "image" | "menu" | "window" | "unknown" | undefined,
      label: params.label,
      text: params.text,
    });
  }

  private async readText(params: { language?: string }) {
    return this.analysisService.readText({
      language: params.language,
    });
  }

  private async getScreenInfo() {
    return this.captureService.getScreenInfo();
  }

  getLastCapture(): ScreenCaptureResult | undefined {
    return this.lastCapture;
  }

  getLastAnalysis(): ScreenAnalysisResult | undefined {
    return this.lastAnalysis;
  }

  getCaptureHistory(): ScreenCaptureResult[] {
    return this.captureService.getCaptureHistory();
  }
}
