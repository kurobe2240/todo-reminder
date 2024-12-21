import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkSessionSettings {
  totalDuration: number; // 総作業時間（分）
  breakInterval: number; // 休憩間隔（分）
  breakDuration: number; // 休憩時間（分）
  autoStart: boolean; // 休憩後に自動で作業を開始するか
  soundEnabled: boolean; // 通知音を鳴らすか
}

export interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date;
  breaks: {
    startTime: Date;
    endTime: Date;
  }[];
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'work' | 'break';
}

interface WorkSessionStore {
  settings: WorkSessionSettings;
  currentSession: WorkSession | null;
  updateSettings: (settings: Partial<WorkSessionSettings>) => Promise<void>;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  startBreak: () => void;
  endBreak: () => void;
  loadSettings: () => Promise<void>;
}

const initialSettings: WorkSessionSettings = {
  totalDuration: 60, // 1時間
  breakInterval: 25, // 25分
  breakDuration: 1.5, // 1分30秒
  autoStart: true,
  soundEnabled: true,
};

const STORAGE_KEY = '@work_session_settings';

export const useWorkSessionStore = create<WorkSessionStore>((set, get) => ({
  settings: initialSettings,
  currentSession: null,

  updateSettings: async (newSettings: Partial<WorkSessionSettings>) => {
    const settings = { ...get().settings, ...newSettings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  startSession: () => {
    const now = new Date();
    const session: WorkSession = {
      id: Date.now().toString(),
      startTime: now,
      endTime: new Date(now.getTime() + get().settings.totalDuration * 60000),
      breaks: [],
      isActive: true,
      isPaused: false,
      currentPhase: 'work',
    };
    set({ currentSession: session });
  },

  pauseSession: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          isPaused: true,
        },
      });
    }
  },

  resumeSession: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          isPaused: false,
        },
      });
    }
  },

  endSession: () => {
    set({ currentSession: null });
  },

  startBreak: () => {
    const session = get().currentSession;
    if (session) {
      const now = new Date();
      const newBreak = {
        startTime: now,
        endTime: new Date(now.getTime() + get().settings.breakDuration * 60000),
      };
      set({
        currentSession: {
          ...session,
          breaks: [...session.breaks, newBreak],
          currentPhase: 'break',
        },
      });
    }
  },

  endBreak: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          currentPhase: 'work',
        },
      });
    }
  },

  loadSettings: async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        set({ settings });
      }
    } catch (error) {
      console.error('作業設定の読み込みに失敗しました:', error);
    }
  },
})); 