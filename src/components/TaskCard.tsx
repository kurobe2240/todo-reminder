import React from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../types/task';
import { WorkTimeManager } from './WorkTimeManager';
import { PomodoroTimer } from './PomodoroTimer';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateWorkTime: (id: string, workTime: Task['workTime']) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onShare: () => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const StyledCard = styled.div<{ completed: boolean; isDragging: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  opacity: ${({ completed, isDragging }) => {
    if (isDragging) return 0.5;
    return completed ? 0.7 : 1;
  }};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h3<{ completed: boolean }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

const PriorityIndicator = styled.span<{ priority: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.xs};
  background: ${({ priority, theme }) => {
    switch (priority) {
      case 'high':
        return theme.colors.danger;
      case 'medium':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  }};
`;

const WorkTimeInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TimerSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateWorkTime,
  onMove,
  onShare
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { type: 'TASK', id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleClick = () => {
    onEdit(task);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('このタスクを削除しますか？')) {
      onDelete(task.id);
    }
  };

  const handleWorkTimeUpdate = (workTime: Task['workTime']) => {
    onUpdateWorkTime(task.id, workTime);
  };

  return (
    <StyledCard
      ref={ref}
      completed={task.completed}
      isDragging={isDragging}
      onClick={handleClick}
    >
      <Meta>
        <PriorityIndicator priority={task.priority} />
        <Tag>{task.category}</Tag>
      </Meta>
      <Title completed={task.completed}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
        />
        {task.title}
      </Title>
      {task.description && <Description>{task.description}</Description>}
      <Meta>
        {task.tags?.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
        <ButtonGroup>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}>
            共有
          </ActionButton>
          <ActionButton onClick={handleDelete}>
            削除
          </ActionButton>
        </ButtonGroup>
      </Meta>
      <WorkTimeInfo onClick={(e) => e.stopPropagation()}>
        <WorkTimeManager
          task={task}
          onUpdate={handleWorkTimeUpdate}
        />
      </WorkTimeInfo>
      <TimerSection onClick={(e) => e.stopPropagation()}>
        <PomodoroTimer
          task={task}
          onWorkTimeUpdate={(minutes) => handleWorkTimeUpdate({
            ...task.workTime,
            actual: (task.workTime?.actual || 0) + minutes
          })}
        />
      </TimerSection>
    </StyledCard>
  );
}; 