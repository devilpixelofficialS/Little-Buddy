"use client";

import { useState } from "react";
import { VoiceSettings } from "./voice-settings";
import { MemorySettings } from "./memory-settings";
import { AISettings } from "./ai-settings";
import { SkillsSettings } from "./skills-settings";
import { useSettingsStore } from "@/stores/settings-store";

type SettingsTab = "voice" | "memory" | "ai" | "skills";

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "voice", label: "Voice", icon: "M12 18.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM6 12a6 6 0 1112 0v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6z" },
  { id: "memory", label: "Memory", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" },
  { id: "ai", label: "AI Model", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "skills", label: "Skills", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("voice");
  const { settings, isDirty, saveSettings, resetSettings } = useSettingsStore();

  const handleSave = async () => {
    try {
      await saveSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      resetSettings();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "voice":
        return <VoiceSettings />;
      case "memory":
        return <MemorySettings />;
      case "ai":
        return <AISettings />;
      case "skills":
        return <SkillsSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">
              Configure your assistant preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-background-tertiary hover:bg-background-secondary rounded-lg transition-colors duration-150"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isDirty
                  ? "text-white bg-accent-primary hover:bg-accent-secondary"
                  : "text-text-muted bg-background-tertiary cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <nav className="w-48 shrink-0">
            <div className="space-y-1">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    activeTab === tab.id
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={tab.icon}
                    />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
