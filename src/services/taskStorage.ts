import { Task, TaskPriority, TaskCategory } from '../types/task';

const STORAGE_KEY = 'tasks';

export const taskStorage = {
  getTasks(): Task[] {
    const tasksJson = localStorage.getItem(STORAGE_KEY);
    if (!tasksJson) return [];

    const tasks = JSON.parse(tasksJson);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      reminder: task.reminder ? new Date(task.reminder) : undefined,
    }));
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const updatedTask = { ...tasks[taskIndex], ...updates };
    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  },

  deleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    if (filteredTasks.length === tasks.length) return false;

    this.saveTasks(filteredTasks);
    return true;
  },

  toggleTaskCompletion(taskId: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    return this.updateTask(taskId, { completed: !task.completed });
  },

  cyclePriority(taskId: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const priorities: TaskPriority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];

    return this.updateTask(taskId, { priority: nextPriority });
  },

  setReminder(taskId: string, reminderDate: Date | undefined): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    return this.updateTask(taskId, { reminder: reminderDate });
  },
}; 