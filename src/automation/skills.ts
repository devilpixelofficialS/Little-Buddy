import { Skill, SkillManifest, SkillExecutionContext, SkillExecutionResult } from "../skills/types";
import { DesktopAutomationService } from "./service";

const automation = new DesktopAutomationService();

export class MouseClickSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:mouse-click",
    name: "Mouse Click",
    description: "Clicks at a specific screen position",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { x, y, button = "left" } = params as { x: number; y: number; button?: string };

    await automation.click({ x, y }, button as "left" | "right" | "middle");

    return {
      success: true,
      output: { clicked: true, x, y, button },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.x === "number" && typeof params.y === "number";
  }
}

export class MouseMoveSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:mouse-move",
    name: "Mouse Move",
    description: "Moves the mouse to a specific position",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { x, y } = params as { x: number; y: number };

    await automation.moveMouse({ x, y });

    return {
      success: true,
      output: { moved: true, x, y },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.x === "number" && typeof params.y === "number";
  }
}

export class TypeTextSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:type-text",
    name: "Type Text",
    description: "Types text using the keyboard",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { text } = params as { text: string };

    await automation.typeText(text);

    return {
      success: true,
      output: { typed: true, text },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.text === "string" && params.text.length > 0;
  }
}

export class PressKeySkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:press-key",
    name: "Press Key",
    description: "Presses a keyboard key",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { key } = params as { key: string };

    await automation.pressKey(key);

    return {
      success: true,
      output: { pressed: true, key },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.key === "string" && params.key.length > 0;
  }
}

export class HotkeySkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:hotkey",
    name: "Hotkey",
    description: "Presses a keyboard shortcut",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { keys } = params as { keys: string[] };

    await automation.hotkey(...keys);

    return {
      success: true,
      output: { hotkey: true, keys },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return Array.isArray(params.keys) && params.keys.length > 0;
  }
}

export class ScreenshotSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:screenshot",
    name: "Screenshot",
    description: "Takes a screenshot of the screen",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["system:execute"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const buffer = await automation.screenshot(params as { region?: { x: number; y: number; width: number; height: number } });

    return {
      success: true,
      output: { screenshot: true, size: buffer.length },
      duration: 0,
    };
  }
}

export class GetClipboardSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:get-clipboard",
    name: "Get Clipboard",
    description: "Gets the clipboard content",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["clipboard:read"],
  };

  async execute(): Promise<SkillExecutionResult> {
    const content = await automation.getClipboard();

    return {
      success: true,
      output: { content },
      duration: 0,
    };
  }
}

export class SetClipboardSkill implements Skill {
  readonly manifest: SkillManifest = {
    id: "automation:set-clipboard",
    name: "Set Clipboard",
    description: "Sets the clipboard content",
    version: "1.0.0",
    author: "Little Buddy",
    category: "desktop",
    permissions: ["clipboard:write"],
  };

  async execute(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const { text } = params as { text: string };

    await automation.setClipboard(text);

    return {
      success: true,
      output: { set: true, text },
      duration: 0,
    };
  }

  validate(params: Record<string, unknown>): boolean {
    return typeof params.text === "string";
  }
}
