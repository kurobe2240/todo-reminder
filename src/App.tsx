import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from './types/task';
import { TaskCard } from './components/TaskCard';
import { TaskEditModal } from './components/TaskEditModal';
import { DataManagement } from './components/DataManagement';
import { Auth } from './components/Auth';
import { ShareSettings } from './components/ShareSettings';
import { lightTheme, darkTheme } from './styles/theme';
import NotificationService from './services/NotificationService';
import AuthService, { User } from './services/AuthService';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
`;

const ThemeToggle = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AddButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.1);
  }
`;

const Stats = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Avatar = styled.div<{ url?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ url, theme }) =>
    url ? `url(${url})` : theme.colors.primary};
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [sharingTask, setSharingTask] = useState<Task | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authService = AuthService.getInstance();
    const savedUser = authService.getUser();
    setUser(savedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const savedTasks = localStorage.getItem(`tasks_${user.id}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
  }, [tasks, user]);

  useEffect(() => {
    const notificationService = NotificationService.getInstance();
    notificationService.requestPermission();

    notificationService.startChecking(tasks);

    return () => {
      notificationService.stopChecking();
    };
  }, [tasks]);

  const handleAddTask = () => {
    setEditingTask(undefined);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      id: editingTask?.id || Date.now().toString(),
      createdAt: editingTask?.createdAt || new Date(),
      updatedAt: new Date(),
      ...taskData
    };

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? newTask : task));
    } else {
      setTasks([...tasks, newTask]);
    }
    setEditingTask(undefined);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleUpdateWorkTime = (id: string, workTime: Task['workTime']) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, workTime } : task
    ));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 統計情報の計算
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    totalEstimatedTime: tasks.reduce((sum, t) => sum + (t.workTime?.estimated || 0), 0),
    totalActualTime: tasks.reduce((sum, t) => sum + (t.workTime?.actual || 0), 0)
  };

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const dragTask = newTasks[dragIndex];
      newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, dragTask);
      return newTasks;
    });
  }, []);

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(importedTasks);
  };

  const handleLogout = () => {
    const authService = AuthService.getInstance();
    authService.logout();
    setUser(null);
    setTasks([]);
  };

  if (!user) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <Auth onAuthStateChange={setUser} />
      </ThemeProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <AppContainer>
          <Header>
            <Title>TODOリスト</Title>
            <UserInfo>
              <Avatar url={user.avatar}>
                {!user.avatar && user.name[0]}
              </Avatar>
              <span>{user.name}</span>
              <Button variant="secondary" onClick={handleLogout}>
                ログアウト
              </Button>
              <ThemeToggle onClick={toggleTheme}>
                {isDarkMode ? '🌞' : '🌙'}
              </ThemeToggle>
            </UserInfo>
          </Header>

          <DataManagement tasks={tasks} onImport={handleImportTasks} />

          <Stats>
            <StatItem>
              <StatLabel>全タスク数</StatLabel>
              <StatValue>{stats.totalTasks}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>完了タスク数</StatLabel>
              <StatValue>{stats.completedTasks}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>予定時間合計</StatLabel>
              <StatValue>{stats.totalEstimatedTime}分</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>実績時間合計</StatLabel>
              <StatValue>{stats.totalActualTime}分</StatValue>
            </StatItem>
          </Stats>

          <TaskList>
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onToggleComplete={handleToggleComplete}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onUpdateWorkTime={handleUpdateWorkTime}
                onMove={moveTask}
                onShare={() => setSharingTask(task)}
              />
            ))}
          </TaskList>

          <AddButton onClick={handleAddTask}>+</AddButton>

          {editingTask !== undefined && (
            <TaskEditModal
              task={editingTask}
              onSave={handleSaveTask}
              onClose={() => setEditingTask(undefined)}
            />
          )}

          {sharingTask !== undefined && (
            <ShareSettings
              task={sharingTask}
              currentUser={user}
              onClose={() => setSharingTask(undefined)}
            />
          )}
        </AppContainer>
      </ThemeProvider>
    </DndProvider>
  );
}

export default App; 