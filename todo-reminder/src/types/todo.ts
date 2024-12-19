export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  reminderTime: Date | null;
  createdAt: Date;
  category: string;
  priority: 'normal' | 'high';
  workTime: number | null;
  startTime: Date | null;
}

export interface TodoFormData {
  title: string;
  description?: string;
  reminderTime: Date | null;
  category: string;
  priority: 'normal' | 'high';
  workTime: number | null;
}

export type SortOption = 'createdAt' | 'reminderTime' | 'priority' | 'title';
export type SortDirection = 'asc' | 'desc'; 