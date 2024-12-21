import { Task } from '../types/task';
import { User } from './AuthService';

interface ShareSettings {
  taskId: string;
  sharedWith: string[];
  permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

class SharingService {
  private static instance: SharingService;
  private shareSettings: Map<string, ShareSettings> = new Map();
  private comments: Map<string, Comment[]> = new Map();

  private constructor() {
    this.loadShareSettings();
    this.loadComments();
  }

  public static getInstance(): SharingService {
    if (!SharingService.instance) {
      SharingService.instance = new SharingService();
    }
    return SharingService.instance;
  }

  private loadShareSettings(): void {
    const savedSettings = localStorage.getItem('shareSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      this.shareSettings = new Map(Object.entries(parsed));
    }
  }

  private saveShareSettings(): void {
    const settings = Object.fromEntries(this.shareSettings);
    localStorage.setItem('shareSettings', JSON.stringify(settings));
  }

  private loadComments(): void {
    const savedComments = localStorage.getItem('comments');
    if (savedComments) {
      const parsed = JSON.parse(savedComments);
      this.comments = new Map(Object.entries(parsed));
    }
  }

  private saveComments(): void {
    const comments = Object.fromEntries(this.comments);
    localStorage.setItem('comments', JSON.stringify(comments));
  }

  public async shareTask(taskId: string, users: string[], permissions: ShareSettings['permissions']): Promise<void> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch('/api/share/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ taskId, users, permissions })
      });

      if (!response.ok) {
        throw new Error('タスクの共有に失敗しました');
      }

      const settings: ShareSettings = {
        taskId,
        sharedWith: users,
        permissions
      };

      this.shareSettings.set(taskId, settings);
      this.saveShareSettings();
    } catch (error) {
      throw new Error('タスクの共有に失敗しました');
    }
  }

  public async getSharedUsers(taskId: string): Promise<User[]> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch(`/api/share/task/${taskId}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('共有ユーザーの取得に失敗しました');
      }

      return await response.json();
    } catch (error) {
      throw new Error('共有ユーザーの取得に失敗しました');
    }
  }

  public async addComment(taskId: string, content: string, user: User): Promise<Comment> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch('/api/share/task/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ taskId, content })
      });

      if (!response.ok) {
        throw new Error('コメントの追加に失敗しました');
      }

      const comment: Comment = {
        id: Date.now().toString(),
        taskId,
        userId: user.id,
        userName: user.name,
        content,
        createdAt: new Date()
      };

      const taskComments = this.comments.get(taskId) || [];
      taskComments.push(comment);
      this.comments.set(taskId, taskComments);
      this.saveComments();

      return comment;
    } catch (error) {
      throw new Error('コメントの追加に失敗しました');
    }
  }

  public async getComments(taskId: string): Promise<Comment[]> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch(`/api/share/task/${taskId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('コメントの取得に失敗しました');
      }

      return await response.json();
    } catch (error) {
      throw new Error('コメントの取得に失敗しました');
    }
  }

  public hasAccess(taskId: string, userId: string): boolean {
    const settings = this.shareSettings.get(taskId);
    return settings?.sharedWith.includes(userId) || false;
  }

  public getPermissions(taskId: string, userId: string): ShareSettings['permissions'] | null {
    const settings = this.shareSettings.get(taskId);
    if (!settings || !settings.sharedWith.includes(userId)) {
      return null;
    }
    return settings.permissions;
  }
}

export default SharingService;
export type { ShareSettings, Comment }; 