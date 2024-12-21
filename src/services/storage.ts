import { TimerPreset, TimerSettings } from '../types/timer';

const STORAGE_KEYS = {
  PRESETS: 'timer_presets',
  CURRENT_SETTINGS: 'current_settings',
  ACTIVE_PRESET_ID: 'active_preset_id',
} as const;

export const storage = {
  savePresets(presets: TimerPreset[]): void {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  },

  getPresets(): TimerPreset[] {
    const presetsJson = localStorage.getItem(STORAGE_KEYS.PRESETS);
    return presetsJson ? JSON.parse(presetsJson) : [];
  },

  saveCurrentSettings(settings: TimerSettings): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SETTINGS, JSON.stringify(settings));
  },

  getCurrentSettings(): TimerSettings | null {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.CURRENT_SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : null;
  },

  saveActivePresetId(presetId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PRESET_ID, presetId);
  },

  getActivePresetId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESET_ID);
  },
}; 