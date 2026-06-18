"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { Switch } from "@/components/ui/switch";

const BUILTIN_SKILLS = [
  {
    skillId: "open-app",
    skillName: "Open Application",
    permission: "desktop:launch",
    description: "Launch applications on your computer",
  },
  {
    skillId: "terminal",
    skillName: "Terminal Command",
    permission: "system:execute",
    description: "Execute terminal commands",
  },
  {
    skillId: "open-url",
    skillName: "Open URL",
    permission: "browser:open",
    description: "Open URLs in your default browser",
  },
  {
    skillId: "read-file",
    skillName: "Read File",
    permission: "filesystem:read",
    description: "Read contents of files",
  },
  {
    skillId: "write-file",
    skillName: "Write File",
    permission: "filesystem:write",
    description: "Create or modify files",
  },
  {
    skillId: "list-directory",
    skillName: "List Directory",
    permission: "filesystem:list",
    description: "List files in a directory",
  },
  {
    skillId: "screenshot",
    skillName: "Screenshot",
    permission: "screen:capture",
    description: "Capture screenshots of your screen",
  },
  {
    skillId: "clipboard",
    skillName: "Clipboard",
    permission: "system:clipboard",
    description: "Read and write to clipboard",
  },
  {
    skillId: "mouse-control",
    skillName: "Mouse Control",
    permission: "input:mouse",
    description: "Control mouse movements and clicks",
  },
  {
    skillId: "keyboard-control",
    skillName: "Keyboard Control",
    permission: "input:keyboard",
    description: "Type text and press keys",
  },
];

export function SkillsSettings() {
  const { settings, updateSkillPermission } = useSettingsStore();
  const { skills } = settings;

  const getPermissionStatus = (skillId: string): boolean => {
    const existing = skills.find((s) => s.skillId === skillId);
    return existing?.granted ?? false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Skills & Permissions
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Manage which skills the assistant can use and their permissions.
        </p>
      </div>

      <div className="space-y-3">
        {BUILTIN_SKILLS.map((skill) => (
          <div
            key={skill.skillId}
            className="flex items-center justify-between py-4 px-4 bg-background-secondary rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">
                {skill.skillName}
              </span>
              <span className="text-xs text-text-muted">
                {skill.description}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {skill.permission}
              </span>
            </div>
            <Switch
              checked={getPermissionStatus(skill.skillId)}
              onCheckedChange={(checked) =>
                updateSkillPermission({
                  skillId: skill.skillId,
                  skillName: skill.skillName,
                  permission: skill.permission,
                  granted: checked,
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-background-secondary rounded-lg border border-background-tertiary">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-accent-warning/20 flex items-center justify-center mt-0.5">
            <span className="text-accent-warning text-xs">!</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              Security Notice
            </span>
            <span className="text-xs text-text-secondary">
              Skills with system permissions can modify files, execute commands,
              and control input devices. Only grant permissions to skills you
              trust. You can review and revoke permissions at any time.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
