export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'shopping' | 'other';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  reminder?: Date;
  createdAt: Date;
}

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work: '💼',
  personal: '👤',
  shopping: '🛍️',
  other: '📌',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#FF6B6B',
  medium: '#FFA500',
  low: '#4CAF50',
}; 