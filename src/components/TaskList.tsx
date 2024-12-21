import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task, TaskPriority, TaskCategory, CATEGORY_ICONS, PRIORITY_COLORS } from '../types/task';
import { taskStorage } from '../services/taskStorage';
import { formatDate } from '../utils/dateUtils';

const Container = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
`;

const TaskItem = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  opacity: ${props => props.completed ? 0.7 : 1};
  
  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
  width: 20px;
  height: 20px;
`;

const TaskTitle = styled.span<{ completed: boolean }>`
  flex: 1;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? '#666' : '#333'};
`;

const PriorityBadge = styled.span<{ priority: TaskPriority }>`
  background-color: ${props => PRIORITY_COLORS[props.priority]};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 10px;
  cursor: pointer;
`;

const CategoryIcon = styled.span`
  margin-right: 10px;
  font-size: 16px;
`;

const ReminderBadge = styled.span`
  color: #666;
  font-size: 12px;
  margin-right: 10px;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    color: #FF6B6B;
  }
`;

const AddTaskInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: #FF69B4;
  }
`;

interface Props {
  onTaskUpdate?: () => void;
}

export const TaskList: React.FC<Props> = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = taskStorage.getTasks();
    setTasks(sortTasks(filterTasks(loadedTasks)));
  };

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesCategory && matchesPriority;
    });
  };

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'category': {
          const categoryOrder = { work: 0, personal: 1, shopping: 2, other: 3 };
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        default:
          return 0;
      }
    });
  };

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      const newTask = taskStorage.addTask({
        title: newTaskTitle.trim(),
        priority: 'medium',
        category: 'other',
        completed: false,
      });
      setTasks(prev => sortTasks([...prev, newTask]));
      setNewTaskTitle('');
      onTaskUpdate?.();
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const updatedTask = taskStorage.toggleTaskCompletion(taskId);
    if (updatedTask) {
      setTasks(prev => sortTasks(prev.map(t => t.id === taskId ? updatedTask : t)));
      onTaskUpdate?.();
    }
  };

  const handleCyclePriority = (taskId: string) => {
    const updatedTask = taskStorage.cyclePriority(taskId);
    if (updatedTask) {
      setTasks(prev => sortTasks(prev.map(t => t.id === taskId ? updatedTask : t)));
      onTaskUpdate?.();
    }
  };

  const handleSetReminder = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const now = new Date();
    const reminderDate = task.reminder ? undefined : new Date(now.getTime() + 30 * 60000); // 30分後
    
    const updatedTask = taskStorage.setReminder(taskId, reminderDate);
    if (updatedTask) {
      setTasks(prev => sortTasks(prev.map(t => t.id === taskId ? updatedTask : t)));
      onTaskUpdate?.();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (taskStorage.deleteTask(taskId)) {
      setTasks(prev => sortTasks(prev.filter(t => t.id !== taskId)));
      onTaskUpdate?.();
    }
  };

  return (
    <Container>
      <Header>
        <Title>タスク一覧</Title>
      </Header>

      <FilterContainer>
        <Select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as TaskCategory | 'all')}
        >
          <option value="all">全てのカテゴリ</option>
          <option value="work">💼 仕事</option>
          <option value="personal">👤 個人</option>
          <option value="shopping">🛍️ 買い物</option>
          <option value="other">📌 その他</option>
        </Select>

        <Select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
        >
          <option value="all">全ての優先度</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </Select>

        <Select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'priority' | 'category')}
        >
          <option value="date">日付順</option>
          <option value="priority">優先度順</option>
          <option value="category">カテゴリ順</option>
        </Select>
      </FilterContainer>

      <AddTaskInput
        type="text"
        placeholder="新しいタスクを入力..."
        value={newTaskTitle}
        onChange={e => setNewTaskTitle(e.target.value)}
        onKeyPress={handleAddTask}
      />

      {tasks.map(task => (
        <TaskItem key={task.id} completed={task.completed}>
          <Checkbox
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggleComplete(task.id)}
          />
          <CategoryIcon>{CATEGORY_ICONS[task.category]}</CategoryIcon>
          <PriorityBadge
            priority={task.priority}
            onClick={() => handleCyclePriority(task.id)}
          >
            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
          </PriorityBadge>
          <TaskTitle completed={task.completed}>{task.title}</TaskTitle>
          {task.reminder && (
            <ReminderBadge onClick={() => handleSetReminder(task.id)}>
              ⏰ {formatDate(task.reminder)}
            </ReminderBadge>
          )}
          {!task.reminder && (
            <ReminderBadge onClick={() => handleSetReminder(task.id)}>
              ⏰
            </ReminderBadge>
          )}
          <Button onClick={() => handleDeleteTask(task.id)}>🗑️</Button>
        </TaskItem>
      ))}
    </Container>
  );
}; 