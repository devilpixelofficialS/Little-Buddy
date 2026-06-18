"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const TTS_VOICES = [
  { value: "af_heart", label: "Heart (Female)" },
  { value: "af_bella", label: "Bella (Female)" },
  { value: "af_nicole", label: "Nicole (Female)" },
  { value: "af_sarah", label: "Sarah (Female)" },
  { value: "am_adam", label: "Adam (Male)" },
  { value: "am_michael", label: "Michael (Male)" },
];

const STT_MODELS = [
  { value: "tiny", label: "Tiny (Fastest)" },
  { value: "base", label: "Base (Balanced)" },
  { value: "small", label: "Small (Better Accuracy)" },
  { value: "medium", label: "Medium (High Accuracy)" },
  { value: "large", label: "Large (Best Accuracy)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

export function VoiceSettings() {
  const { settings, updateVoiceSettings } = useSettingsStore();
  const { voice } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Voice Settings
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Configure voice interaction, wake word, and speech settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Enable Voice
            </span>
            <span className="text-xs text-text-muted">
              Turn on voice interaction features
            </span>
          </div>
          <Switch
            checked={voice.enabled}
            onCheckedChange={(checked) =>
              updateVoiceSettings({ enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Wake Word Detection
            </span>
            <span className="text-xs text-text-muted">
              Listen for &quot;Hey Buddy&quot; to activate
            </span>
          </div>
          <Switch
            checked={voice.wakeWordEnabled}
            onCheckedChange={(checked) =>
              updateVoiceSettings({ wakeWordEnabled: checked })
            }
            disabled={!voice.enabled}
          />
        </div>

        <Input
          label="Wake Word Phrase"
          value={voice.wakeWord}
          onChange={(e) => updateVoiceSettings({ wakeWord: e.target.value })}
          disabled={!voice.enabled || !voice.wakeWordEnabled}
          placeholder="hey buddy"
          helperText="The phrase that activates the assistant"
        />

        <Select
          label="TTS Voice"
          value={voice.ttsVoice}
          onChange={(e) => updateVoiceSettings({ ttsVoice: e.target.value })}
          options={TTS_VOICES}
          disabled={!voice.enabled}
          helperText="Select the voice for text-to-speech"
        />

        <Slider
          label="Speech Speed"
          value={voice.ttsSpeed}
          onValueChange={(value) => updateVoiceSettings({ ttsSpeed: value })}
          min={0.5}
          max={2.0}
          step={0.1}
          disabled={!voice.enabled}
          formatValue={(v) => `${v.toFixed(1)}x`}
        />

        <Slider
          label="Speech Pitch"
          value={voice.ttsPitch}
          onValueChange={(value) => updateVoiceSettings({ ttsPitch: value })}
          min={0.5}
          max={2.0}
          step={0.1}
          disabled={!voice.enabled}
          formatValue={(v) => `${v.toFixed(1)}x`}
        />

        <Select
          label="Speech Recognition Model"
          value={voice.sttModel}
          onChange={(e) => updateVoiceSettings({ sttModel: e.target.value })}
          options={STT_MODELS}
          disabled={!voice.enabled}
          helperText="Larger models are more accurate but slower"
        />

        <Select
          label="Language"
          value={voice.language}
          onChange={(e) => updateVoiceSettings({ language: e.target.value })}
          options={LANGUAGES}
          disabled={!voice.enabled}
        />

        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Auto-Start Listening
            </span>
            <span className="text-xs text-text-muted">
              Automatically start listening after response
            </span>
          </div>
          <Switch
            checked={voice.autoStartListening}
            onCheckedChange={(checked) =>
              updateVoiceSettings({ autoStartListening: checked })
            }
            disabled={!voice.enabled}
          />
        </div>

        <Slider
          label="Silence Timeout"
          value={voice.silenceTimeout}
          onValueChange={(value) =>
            updateVoiceSettings({ silenceTimeout: value })
          }
          min={1000}
          max={10000}
          step={500}
          disabled={!voice.enabled}
          formatValue={(v) => `${v / 1000}s`}
          helperText="How long to wait before stopping recording"
        />
      </div>
    </div>
  );
}
