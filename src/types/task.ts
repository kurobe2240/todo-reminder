export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'shopping' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: TaskPriority;
  category: TaskCategory;
  tags?: string[];
  reminder?: {
    datetime: Date;
    repeat?: {
      type: 'daily' | 'weekly' | 'monthly';
      days?: number[];  // 曜日（0-6）または日付（1-31）
    };
  };
  workTime?: {
    estimated: number;  // 分単位
    actual?: number;    // 分単位
    pomodoro?: {
      workDuration: number;  // 分単位
      breakDuration: number; // 分単位
      longBreakDuration: number; // 分単位
      sessionsBeforeLongBreak: number;
    };
  };
} 