"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export function MemorySettings() {
  const { settings, updateMemorySettings } = useSettingsStore();
  const { memory } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Memory Settings
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Configure how the assistant remembers and manages information.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Enable Memory
            </span>
            <span className="text-xs text-text-muted">
              Allow the assistant to store and recall information
            </span>
          </div>
          <Switch
            checked={memory.enabled}
            onCheckedChange={(checked) =>
              updateMemorySettings({ enabled: checked })
            }
          />
        </div>

        <Slider
          label="Maximum Memories"
          value={memory.maxMemories}
          onValueChange={(value) =>
            updateMemorySettings({ maxMemories: value })
          }
          min={1000}
          max={50000}
          step={1000}
          disabled={!memory.enabled}
          formatValue={(v) => `${(v / 1000).toFixed(0)}k`}
        />

        <Slider
          label="Retention Period"
          value={memory.retentionDays}
          onValueChange={(value) =>
            updateMemorySettings({ retentionDays: value })
          }
          min={7}
          max={365}
          step={1}
          disabled={!memory.enabled}
          formatValue={(v) => `${v} days`}
        />

        <div className="flex items-center justify-between py-3 border-b border-background-tertiary">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Auto-Consolidate
            </span>
            <span className="text-xs text-text-muted">
              Automatically merge and organize related memories
            </span>
          </div>
          <Switch
            checked={memory.autoConsolidate}
            onCheckedChange={(checked) =>
              updateMemorySettings({ autoConsolidate: checked })
            }
            disabled={!memory.enabled}
          />
        </div>

        <Slider
          label="Consolidation Interval"
          value={memory.consolidationInterval}
          onValueChange={(value) =>
            updateMemorySettings({ consolidationInterval: value })
          }
          min={1800000}
          max={86400000}
          step={1800000}
          disabled={!memory.enabled || !memory.autoConsolidate}
          formatValue={(v) => {
            const hours = v / 3600000;
            return hours >= 24 ? `${hours / 24}d` : `${hours}h`;
          }}
        />
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-text-primary mb-4">
          Memory Categories
        </h4>
        <div className="space-y-3">
          {memory.categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between py-3 px-4 bg-background-secondary rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">
                  {category.name}
                </span>
                <span className="text-xs text-text-muted">
                  Max {category.maxItems.toLocaleString()} items
                </span>
              </div>
              <Switch
                checked={category.enabled}
                onCheckedChange={(checked) => {
                  const updatedCategories = memory.categories.map((c) =>
                    c.id === category.id ? { ...c, enabled: checked } : c
                  );
                  updateMemorySettings({ categories: updatedCategories });
                }}
                disabled={!memory.enabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
