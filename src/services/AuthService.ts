interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null
  };

  private constructor() {
    this.loadAuthState();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadAuthState(): void {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      this.authState = JSON.parse(savedAuth);
    }
  }

  private saveAuthState(): void {
    localStorage.setItem('auth', JSON.stringify(this.authState));
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('認証に失敗しました');
      }

      const data = await response.json();
      this.authState = {
        user: data.user,
        isAuthenticated: true,
        token: data.token
      };

      this.saveAuthState();
      return data.user;
    } catch (error) {
      throw new Error('ログインに失敗しました');
    }
  }

  public async register(email: string, password: string, name: string): Promise<User> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }

      const data = await response.json();
      this.authState = {
        user: data.user,
        isAuthenticated: true,
        token: data.token
      };

      this.saveAuthState();
      return data.user;
    } catch (error) {
      throw new Error('アカウント登録に失敗しました');
    }
  }

  public logout(): void {
    this.authState = {
      user: null,
      isAuthenticated: false,
      token: null
    };
    this.saveAuthState();
    localStorage.removeItem('auth');
  }

  public getUser(): User | null {
    return this.authState.user;
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      // TODO: 実際のAPIエンドポイントに接続
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authState.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const updatedUser = await response.json();
      this.authState.user = updatedUser;
      this.saveAuthState();
      return updatedUser;
    } catch (error) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  }
}

export default AuthService;
export type { User }; 