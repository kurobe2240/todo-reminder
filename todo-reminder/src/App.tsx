import React, { useState, useEffect } from 'react';
import './App.css';
import { Todo, TodoFormData, SortOption, SortDirection } from './types/todo';

interface Notification {
  id: string;
  title: string;
  message: string;
}

const STORAGE_KEY = 'todo-reminder-tasks';
const NOTIFICATION_SETTING_KEY = 'notification-enabled';
const CATEGORIES = ['仕事', '個人', '買い物', 'その他'];
const WORK_TIMES = Array.from({ length: 24 }, (_, i) => (i + 1) * 10); // 10分から240分（4時間）まで10分刻み

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      return parsedTodos.map((todo: any) => ({
        ...todo,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null,
        startTime: todo.startTime ? new Date(todo.startTime) : null,
        createdAt: new Date(todo.createdAt)
      }));
    }
    return [];
  });

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    reminderTime: null,
    category: 'その他',
    priority: 'normal',
    workTime: null
  });

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(NOTIFICATION_SETTING_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = async (title: string, message: string) => {
    console.log('通知を表示しようとしています:', { title, message });
    
    try {
      const id = `notification-${Date.now()}`;
      
      // 画面上の通知を表示
      setNotifications(prev => [...prev, { id, title, message }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 10000);

      // ブラウザ通知を表示
      if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.warn('通知が許可されていません');
            return;
          }
        }

        const notification = new Notification(title, {
          body: message,
          icon: '/logo192.png',
          tag: id,
          requireInteraction: false,
          silent: false
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // 10秒後に通知を自動で閉じる
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('このブラウザは通知をサポートしていません');
        return;
      }

      const permission = await Notification.requestPermission();
      console.log('通知の許可状態:', permission);

      if (permission === 'granted') {
        setNotificationEnabled(true);
        setNotificationPermission(true);
        
        // テスト通知を表示
        showNotification('通知テスト', '通知が正常に設定されました！');
      } else {
        setNotificationEnabled(false);
        setNotificationPermission(false);
        alert('通知を有効にするには、通知を許可してください。');
      }
    } catch (error) {
      console.error('通知の許可を取得できませんでした:', error);
      alert('通知の設定中にエラーが発生しました。');
      setNotificationEnabled(false);
      setNotificationPermission(false);
    }
  };

  const disableNotifications = () => {
    setNotificationEnabled(false);
  };

  useEffect(() => {
    const checkReminders = setInterval(() => {
      if (!notificationEnabled) return;

      const now = new Date();
      todos.forEach(todo => {
        // リマインダー時刻の通知
        if (todo.reminderTime && !todo.completed) {
          const timeDiff = todo.reminderTime.getTime() - now.getTime();
          if (timeDiff > 0 && timeDiff <= 30000) { // 30秒以内
            try {
              showNotification(
                'TODOリマインダー',
                `「${todo.title}」の時間です！`
              );
            } catch (error) {
              console.error('リマインダー通知の表示に失敗しました:', error);
            }
          }
        }

        // 業時間終了の通知
        if (todo.startTime && todo.workTime && !todo.completed) {
          try {
            const endTime = new Date(todo.startTime.getTime() + (todo.workTime * 60000));
            const timeDiff = endTime.getTime() - now.getTime();
            if (timeDiff > 0 && timeDiff <= 30000) { // 30秒以内
              showNotification(
                '作業時間終了',
                `「${todo.title}」の作業時間（${todo.workTime}分）経しました！`
              );
            }
          } catch (error) {
            console.error('作業時間通知の表示に失敗しました:', error);
          }
        }
      });
    }, 30000); // 30秒ごとにチェック

    return () => clearInterval(checkReminders);
  }, [todos, notificationEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTodo) {
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === editingTodo.id
          ? {
              ...todo,
              title: formData.title,
              description: formData.description,
              reminderTime: formData.reminderTime,
              category: formData.category,
              priority: formData.priority,
              workTime: formData.workTime,
              startTime: todo.startTime
            }
          : todo
      ));
      setEditingTodo(null);
    } else {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        completed: false,
        reminderTime: formData.reminderTime,
        createdAt: new Date(),
        category: formData.category,
        priority: formData.priority,
        workTime: formData.workTime,
        startTime: null
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
    }

    setFormData({
      title: '',
      description: '',
      reminderTime: null,
      category: 'その他',
      priority: 'normal',
      workTime: null
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      reminderTime: todo.reminderTime,
      category: todo.category,
      priority: todo.priority,
      workTime: todo.workTime
    });
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      description: '',
      reminderTime: null,
      category: 'その他',
      priority: 'normal',
      workTime: null
    });
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo || todo.completed) return;

    // まずcompletedをtrueに設定
    setTodos(prevTodos => prevTodos.map(t =>
      t.id === id ? { ...t, completed: true } : t
    ));

    // アニメーション完了後（0.5秒後）にタスクを削除
    setTimeout(() => {
      setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
    }, 500);
  };

  const deleteTodo = (id: string) => {
    if (window.confirm('のタスクを削除してもよろしいですか？')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const startWork = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, startTime: new Date() } : todo
    ));
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // まず優先度で比較
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }

      // 優先度が同じ場合、リマインド時間で比較
      if (a.priority === 'high' && b.priority === 'high') {
        if (!a.reminderTime && !b.reminderTime) return 0;
        if (!a.reminderTime) return 1;
        if (!b.reminderTime) return -1;
        return a.reminderTime.getTime() - b.reminderTime.getTime();
      }

      // それ以外は選択されたソート順で比較
      let comparison = 0;
      switch (sortOption) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'reminderTime':
          if (!a.reminderTime && !b.reminderTime) comparison = 0;
          else if (!a.reminderTime) comparison = 1;
          else if (!b.reminderTime) comparison = -1;
          else comparison = a.reminderTime.getTime() - b.reminderTime.getTime();
          break;
        default: // createdAt
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const reminderDate = new Date(dateValue);
      setFormData({ ...formData, reminderTime: reminderDate });
    } else {
      setFormData({ ...formData, reminderTime: null });
    }
  };

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTING_KEY, JSON.stringify(notificationEnabled));
  }, [notificationEnabled]);

  const testNotification = () => {
    showNotification('テスト通知', 'これはテスト通知です');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODOリマインダー</h1>
        
        <div className="notification-controls">
          {!notificationEnabled ? (
            <button
              onClick={requestNotificationPermission}
              className="notification-button enable"
            >
              通知を有効にする
            </button>
          ) : (
            <>
              <button
                onClick={disableNotifications}
                className="notification-button disable"
              >
                通知を無効にする
              </button>
              <button
                onClick={testNotification}
                className="notification-button test"
              >
                通知テスト
              </button>
            </>
          )}
        </div>

        <div className="search-sort-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タスクを検索..."
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">すべてのカテゴリー</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="sort-controls">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="createdAt">作成日時</option>
              <option value="reminderTime">リマインド時刻</option>
              <option value="priority">優先度</option>
              <option value="title">タイトル</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="sort-direction-button"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="todo-form">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="タスクを入力"
            className="todo-input"
            required
          />
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="詳細を入力（任意）"
            className="todo-textarea"
          />
          <div className="form-row">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="category-select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'normal' | 'high' })}
              className="priority-select"
            >
              <option value="normal">通常</option>
              <option value="high">優先</option>
            </select>
          </div>
          <div className="form-row">
            <select
              value={formData.workTime?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, workTime: e.target.value ? parseInt(e.target.value) : null })}
              className="worktime-select"
            >
              <option value="">作業時間を設定しない</option>
              {WORK_TIMES.map(minutes => (
                <option key={minutes} value={minutes}>{minutes}分</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={formData.reminderTime ? formatDateForInput(formData.reminderTime) : ''}
              onChange={handleDateTimeChange}
              className="todo-datetime"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="todo-submit">
              {editingTodo ? '更新' : '追加'}
            </button>
            {editingTodo && (
              <button type="button" onClick={cancelEditing} className="todo-cancel">
                キャンセル
              </button>
            )}
          </div>
        </form>

        <div className="todo-list">
          {filteredAndSortedTodos.length === 0 ? (
            <p className="no-todos">
              {searchQuery || selectedCategory !== 'all'
                ? 'タクが見つ���りません'
                : 'タスクがあません'}
            </p>
          ) : (
            filteredAndSortedTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}>
                <div className="todo-item-header">
                  <label className="todo-checkbox-label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="todo-checkbox"
                    />
                    <span className="todo-title">{todo.title}</span>
                  </label>
                  <div className="todo-actions">
                    {todo.workTime && !todo.startTime && !todo.completed && (
                      <button
                        onClick={() => startWork(todo.id)}
                        className="todo-start"
                      >
                        開始
                      </button>
                    )}
                    <button
                      onClick={() => startEditing(todo)}
                      className="todo-edit"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="todo-delete"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="todo-meta">
                  <span className="todo-category">{todo.category}</span>
                  <span className={`todo-priority priority-${todo.priority}`}>
                    優先度: {todo.priority === 'high' ? '最優先' : '通常'}
                  </span>
                  {todo.workTime && (
                    <span className="todo-worktime">
                      作業時間: {todo.workTime}分
                    </span>
                  )}
                </div>
                {todo.description && (
                  <p className="todo-description">{todo.description}</p>
                )}
                {todo.reminderTime && (
                  <p className="todo-reminder">
                    リマインダー: {formatDate(todo.reminderTime)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </header>

      {notifications.map(notification => (
        <div key={notification.id} className="popup-notification">
          <div className="title">{notification.title}</div>
          <div className="message">{notification.message}</div>
        </div>
      ))}
    </div>
  );
};

export default App;
