export type TimerPhase = 'work' | 'break';

export interface TimerSettings {
  totalWorkTime: number;  // 秒単位
  breakInterval: number;  // 秒単位
  breakDuration: number;  // 秒単位
  autoStartAfterBreak: boolean;
  soundEnabled: boolean;
}

export interface TimerPreset {
  id: string;
  name: string;
  settings: TimerSettings;
  isDefault: boolean;
}

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    name: 'ポモドーロ',
    settings: {
      totalWorkTime: 25 * 60,      // 25分
      breakInterval: 25 * 60,      // 25分
      breakDuration: 5 * 60,       // 5分
      autoStartAfterBreak: true,
      soundEnabled: true,
    },
    isDefault: true,
  },
  {
    id: 'long-focus',
    name: '長時間集中',
    settings: {
      totalWorkTime: 4 * 60 * 60,  // 4時間
      breakInterval: 50 * 60,      // 50分
      breakDuration: 10 * 60,      // 10分
      autoStartAfterBreak: true,
      soundEnabled: true,
    },
    isDefault: true,
  },
  {
    id: 'short-sprint',
    name: 'ショートスプリント',
    settings: {
      totalWorkTime: 60 * 60,      // 1��間
      breakInterval: 15 * 60,      // 15分
      breakDuration: 3 * 60,       // 3分
      autoStartAfterBreak: true,
      soundEnabled: true,
    },
    isDefault: true,
  },
]; 