"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "local", label: "Local Model" },
];

const OPENAI_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const ANTHROPIC_MODELS = [
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
];

const LOG_LEVELS = [
  { value: "debug", label: "Debug" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warning" },
  { value: "error", label: "Error" },
];

export function AISettings() {
  const { settings, updateAISettings, updateGeneralSettings } = useSettingsStore();
  const { ai, general } = settings;

  const models = ai.provider === "anthropic" ? ANTHROPIC_MODELS : OPENAI_MODELS;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          AI Model Settings
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Configure the AI model and language processing settings.
        </p>
      </div>

      <div className="space-y-4">
        <Select
          label="AI Provider"
          value={ai.provider}
          onChange={(e) =>
            updateAISettings({
              provider: e.target.value as "openai" | "anthropic" | "local",
            })
          }
          options={AI_PROVIDERS}
        />

        <Input
          label="API Key"
          type="password"
          value={ai.apiKey}
          onChange={(e) => updateAISettings({ apiKey: e.target.value })}
          placeholder="sk-..."
          helperText="Your API key is stored locally and never shared"
        />

        <Select
          label="Model"
          value={ai.model}
          onChange={(e) => updateAISettings({ model: e.target.value })}
          options={models}
        />

        <Slider
          label="Temperature"
          value={ai.temperature}
          onValueChange={(value) => updateAISettings({ temperature: value })}
          min={0}
          max={2}
          step={0.1}
          formatValue={(v) => v.toFixed(1)}
          helperText="Higher values make output more random, lower more focused"
        />

        <Slider
          label="Max Tokens"
          value={ai.maxTokens}
          onValueChange={(value) => updateAISettings({ maxTokens: value })}
          min={256}
          max={8192}
          step={256}
          formatValue={(v) => v.toLocaleString()}
          helperText="Maximum length of AI response"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            System Prompt
          </label>
          <textarea
            value={ai.systemPrompt}
            onChange={(e) => updateAISettings({ systemPrompt: e.target.value })}
            rows={4}
            className="px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent hover:border-text-muted transition-colors duration-150 resize-none"
            placeholder="Instructions for the AI assistant..."
          />
          <p className="text-xs text-text-muted">
            Define how the assistant should behave and respond
          </p>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Enable Streaming
            </span>
            <span className="text-xs text-text-muted">
              Show response as it&apos;s being generated
            </span>
          </div>
          <Switch
            checked={ai.enableStreaming}
            onCheckedChange={(checked) =>
              updateAISettings({ enableStreaming: checked })
            }
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-background-tertiary">
        <h4 className="text-md font-medium text-text-primary mb-4">
          General
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                Enable Notifications
              </span>
              <span className="text-xs text-text-muted">
                Show desktop notifications
              </span>
            </div>
            <Switch
              checked={general.enableNotifications}
              onCheckedChange={(checked) =>
                updateGeneralSettings({ enableNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                Enable Sounds
              </span>
              <span className="text-xs text-text-muted">
                Play sound effects for interactions
              </span>
            </div>
            <Switch
              checked={general.enableSounds}
              onCheckedChange={(checked) =>
                updateGeneralSettings({ enableSounds: checked })
              }
            />
          </div>

          <Select
            label="Log Level"
            value={general.logLevel}
            onChange={(e) =>
              updateGeneralSettings({
                logLevel: e.target.value as "debug" | "info" | "warn" | "error",
              })
            }
            options={LOG_LEVELS}
            helperText="Verbose logging can help with debugging"
          />
        </div>
      </div>
    </div>
  );
}
