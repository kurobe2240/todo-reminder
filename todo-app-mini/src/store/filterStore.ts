import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SoundType } from '../services/NotificationService';

export interface FilterCondition {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  soundType?: SoundType;
  repeatType?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  condition: FilterCondition;
  createdAt: Date;
}

interface FilterStore {
  presets: FilterPreset[];
  addPreset: (name: string, condition: FilterCondition) => Promise<void>;
  removePreset: (id: string) => Promise<void>;
  loadPresets: () => Promise<void>;
}

const STORAGE_KEY = '@filter_presets';

export const useFilterStore = create<FilterStore>((set, get) => ({
  presets: [],

  addPreset: async (name: string, condition: FilterCondition) => {
    const preset: FilterPreset = {
      id: Date.now().toString(),
      name,
      condition,
      createdAt: new Date(),
    };
    const newPresets = [...get().presets, preset];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    set({ presets: newPresets });
  },

  removePreset: async (id: string) => {
    const newPresets = get().presets.filter(preset => preset.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    set({ presets: newPresets });
  },

  loadPresets: async () => {
    try {
      const storedPresets = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPresets) {
        const presets: FilterPreset[] = JSON.parse(storedPresets);
        // 日付をDateオブジェクトに変換
        presets.forEach(preset => {
          preset.createdAt = new Date(preset.createdAt);
          if (preset.condition.dateRange) {
            preset.condition.dateRange.startDate = new Date(preset.condition.dateRange.startDate);
            preset.condition.dateRange.endDate = new Date(preset.condition.dateRange.endDate);
          }
        });
        set({ presets });
      }
    } catch (error) {
      console.error('プリセットの読み込みに失敗しました:', error);
    }
  },
})); 