import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AppSettings,
  VoiceSettings,
  MemorySettings,
  AISettings,
  GeneralSettings,
  SkillPermission,
  DEFAULT_SETTINGS,
} from "@/types/settings";

interface SettingsState {
  settings: AppSettings;
  isDirty: boolean;
  isLoading: boolean;

  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  updateMemorySettings: (settings: Partial<MemorySettings>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateSkillPermission: (permission: SkillPermission) => void;
  removeSkillPermission: (skillId: string) => void;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isDirty: false,
      isLoading: false,

      updateVoiceSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            voice: { ...state.settings.voice, ...newSettings },
          },
          isDirty: true,
        })),

      updateMemorySettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            memory: { ...state.settings.memory, ...newSettings },
          },
          isDirty: true,
        })),

      updateAISettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ai: { ...state.settings.ai, ...newSettings },
          },
          isDirty: true,
        })),

      updateGeneralSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...newSettings },
          },
          isDirty: true,
        })),

      updateSkillPermission: (permission) =>
        set((state) => {
          const existing = state.settings.skills.find(
            (s) => s.skillId === permission.skillId
          );
          const skills = existing
            ? state.settings.skills.map((s) =>
                s.skillId === permission.skillId ? permission : s
              )
            : [...state.settings.skills, permission];
          return {
            settings: { ...state.settings, skills },
            isDirty: true,
          };
        }),

      removeSkillPermission: (skillId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            skills: state.settings.skills.filter((s) => s.skillId !== skillId),
          },
          isDirty: true,
        })),

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const stored = localStorage.getItem("little-buddy-settings");
          if (stored) {
            const parsed = JSON.parse(stored) as AppSettings;
            set({ settings: { ...DEFAULT_SETTINGS, ...parsed }, isDirty: false });
          }
        } catch (error) {
          console.error("Failed to load settings:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveSettings: async () => {
        set({ isLoading: true });
        try {
          const { settings } = get();
          localStorage.setItem("little-buddy-settings", JSON.stringify(settings));
          set({ isDirty: false });
        } catch (error) {
          console.error("Failed to save settings:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetSettings: () => {
        const stored = localStorage.getItem("little-buddy-settings");
        if (stored) {
          const parsed = JSON.parse(stored) as AppSettings;
          set({ settings: { ...DEFAULT_SETTINGS, ...parsed }, isDirty: false });
        }
      },

      resetToDefaults: () => {
        set({ settings: DEFAULT_SETTINGS, isDirty: true });
      },
    }),
    {
      name: "little-buddy-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
