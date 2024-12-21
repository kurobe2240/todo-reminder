import React, { useState, useEffect } from 'react';
import './App.css';

// タスクの型定義
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // アプリ起動時にデータを読み込む
  useEffect(() => {
    loadTasks();
  }, []);

  // データの読み込み
  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      alert('データの読み込みに失敗しました');
    }
  };

  // データの保存
  const saveTasks = (newTasks: Task[]) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {
      alert('データの保存に失敗しました');
    }
  };

  // タスクの追加
  const addTask = () => {
    if (taskText.trim().length > 0) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText.trim(),
        completed: false,
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      saveTasks(newTasks);
      setTaskText('');
    }
  };

  // タスクの完了/未完了の切り替え
  const toggleTask = (id: string) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // タスクの削除
  const deleteTask = (id: string) => {
    if (window.confirm('このタスクを削除しますか？')) {
      const newTasks = tasks.filter(task => task.id !== id);
      setTasks(newTasks);
      saveTasks(newTasks);
    }
  };

  // Enterキーでタスクを追加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="container">
      <h1 className="title">TODOリスト</h1>
      <div className="input-container">
        <input
          type="text"
          className="input"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新しいタスクを入力"
        />
        <button className="add-button" onClick={addTask}>
          追加
        </button>
      </div>
      <div className="list">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`task ${task.completed ? 'task-completed' : ''}`}
            onClick={() => toggleTask(task.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              deleteTask(task.id);
            }}
          >
            <span className={`task-text ${task.completed ? 'task-text-completed' : ''}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 