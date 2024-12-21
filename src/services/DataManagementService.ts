import { Task } from '../types/task';

interface AppData {
  tasks: Task[];
  version: string;
  exportDate: string;
}

class DataManagementService {
  private static instance: DataManagementService;
  private readonly currentVersion = '1.0.0';

  private constructor() {}

  public static getInstance(): DataManagementService {
    if (!DataManagementService.instance) {
      DataManagementService.instance = new DataManagementService();
    }
    return DataManagementService.instance;
  }

  public exportData(tasks: Task[]): void {
    const data: AppData = {
      tasks,
      version: this.currentVersion,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-reminder-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async importData(file: File): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as AppData;

          // バージョンチェック
          if (!this.isVersionCompatible(data.version)) {
            reject(new Error(`互換性のないバージョンです: ${data.version}`));
            return;
          }

          // データの検証
          if (!this.validateData(data)) {
            reject(new Error('データの形式が正しくありません'));
            return;
          }

          resolve(data.tasks);
        } catch (error) {
          reject(new Error('ファイルの読み込みに失敗しました'));
        }
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };

      reader.readAsText(file);
    });
  }

  private isVersionCompatible(version: string): boolean {
    // バージョン互換性チェックのロジック
    // 現在は単純な比較のみ
    return version === this.currentVersion;
  }

  private validateData(data: AppData): boolean {
    // データの検証ロジック
    if (!Array.isArray(data.tasks)) return false;

    // 各タスクの必須フィールドをチェック
    return data.tasks.every(task => {
      return (
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.completed === 'boolean' &&
        task.createdAt instanceof Date
      );
    });
  }
}

export default DataManagementService; 