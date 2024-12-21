import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'other';
export type RepeatType = 'none' | 'day' | 'week' | 'month';
export type SoundType = 'default' | 'bell' | 'chime' | 'glass';

export interface Reminder {
  date: number;
  repeatType: RepeatType;
  soundType: SoundType;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  reminder?: Reminder;
  priority: Priority;
  category: Category;
}

interface TodoStore {
  todos: Todo[];
  categories: Category[];
  addTodo: (title: string, priority: Priority, category: Category, reminder?: Reminder) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  setReminder: (id: string, reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  loadTodos: () => Promise<void>;
  filterByCategory: (category: Category | null) => Todo[];
  filterByPriority: (priority: Priority | null) => Todo[];
  sortTodos: (by: 'priority' | 'date' | 'category') => Todo[];
}

const STORAGE_KEY = '@todo_app_mini:todos';

const priorityOrder: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  categories: ['work', 'personal', 'shopping', 'other'],
  
  addTodo: (title: string, priority: Priority = 'medium', category: Category = 'other', reminder?: Reminder) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      reminder,
      priority,
      category,
    };
    
    set((state) => {
      const newTodos = [...state.todos, newTodo];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      
      if (reminder) {
        NotificationService.scheduleNotification(
          newTodo.id,
          newTodo.title,
          new Date(reminder.date),
          reminder.repeatType === 'none' ? undefined : reminder.repeatType,
          reminder.soundType
        );
      }
      
      return { todos: newTodos };
    });
  },
  
  toggleTodo: (id: string) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },
  
  removeTodo: (id: string) => {
    set((state) => {
      const newTodos = state.todos.filter((todo) => todo.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      NotificationService.cancelNotification(id);
      return { todos: newTodos };
    });
  },

  updateTodo: (id: string, updates: Partial<Todo>) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },

  setReminder: (id: string, reminder: Reminder) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, reminder } : todo
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      
      NotificationService.scheduleNotification(
        id,
        newTodos.find(todo => todo.id === id)?.title || '',
        new Date(reminder.date),
        reminder.repeatType === 'none' ? undefined : reminder.repeatType,
        reminder.soundType
      );
      
      return { todos: newTodos };
    });
  },

  removeReminder: (id: string) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, reminder: undefined } : todo
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      NotificationService.cancelNotification(id);
      return { todos: newTodos };
    });
  },
  
  loadTodos: async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const todos = JSON.parse(storedTodos);
        set({ todos });
        
        // リマインダーの再設定
        todos.forEach((todo: Todo) => {
          if (todo.reminder && !todo.completed) {
            NotificationService.scheduleNotification(
              todo.id,
              todo.title,
              new Date(todo.reminder.date),
              todo.reminder.repeatType === 'none' ? undefined : todo.reminder.repeatType,
              todo.reminder.soundType
            );
          }
        });
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  },

  filterByCategory: (category: Category | null) => {
    const { todos } = get();
    if (!category) return todos;
    return todos.filter((todo) => todo.category === category);
  },

  filterByPriority: (priority: Priority | null) => {
    const { todos } = get();
    if (!priority) return todos;
    return todos.filter((todo) => todo.priority === priority);
  },

  sortTodos: (by: 'priority' | 'date' | 'category') => {
    const { todos } = get();
    const sortedTodos = [...todos];

    switch (by) {
      case 'priority':
        return sortedTodos.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'date':
        return sortedTodos.sort((a, b) => b.createdAt - a.createdAt);
      case 'category':
        return sortedTodos.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sortedTodos;
    }
  },
})); 