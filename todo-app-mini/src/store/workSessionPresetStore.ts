import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkSessionSettings } from './workSessionStore';

export interface WorkSessionPreset {
  id: string;
  name: string;
  settings: WorkSessionSettings;
}

interface WorkSessionPresetStore {
  presets: WorkSessionPreset[];
  addPreset: (name: string, settings: WorkSessionSettings) => Promise<void>;
  removePreset: (id: string) => Promise<void>;
  loadPresets: () => Promise<void>;
}

const STORAGE_KEY = '@work_session_presets';

// デフォルトのプリセット
const defaultPresets: WorkSessionPreset[] = [
  {
    id: 'pomodoro',
    name: 'ポモドーロ',
    settings: {
      totalDuration: 240, // 4時間
      breakInterval: 25, // 25分
      breakDuration: 5, // 5分
      autoStart: true,
      soundEnabled: true,
    },
  },
  {
    id: 'long-focus',
    name: '長時間集中',
    settings: {
      totalDuration: 480, // 8時間
      breakInterval: 90, // 1時間30分
      breakDuration: 15, // 15分
      autoStart: true,
      soundEnabled: true,
    },
  },
  {
    id: 'short-sprint',
    name: '短時間スプリント',
    settings: {
      totalDuration: 120, // 2時間
      breakInterval: 30, // 30分
      breakDuration: 5, // 5分
      autoStart: true,
      soundEnabled: true,
    },
  },
];

export const useWorkSessionPresetStore = create<WorkSessionPresetStore>((set) => ({
  presets: defaultPresets,

  addPreset: async (name: string, settings: WorkSessionSettings) => {
    const newPreset: WorkSessionPreset = {
      id: Date.now().toString(),
      name,
      settings,
    };
    const currentPresets = [...defaultPresets];
    const updatedPresets = [...currentPresets, newPreset];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    set({ presets: updatedPresets });
  },

  removePreset: async (id: string) => {
    const currentPresets = [...defaultPresets];
    const updatedPresets = currentPresets.filter(preset => preset.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    set({ presets: updatedPresets });
  },

  loadPresets: async () => {
    try {
      const storedPresets = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPresets) {
        const presets = JSON.parse(storedPresets);
        set({ presets });
      } else {
        set({ presets: defaultPresets });
      }
    } catch (error) {
      console.error('プリセットの読み込みに失敗しました:', error);
      set({ presets: defaultPresets });
    }
  },
})); 