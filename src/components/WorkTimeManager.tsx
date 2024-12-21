import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task } from '../types/task';

interface WorkTimeManagerProps {
  task: Task;
  onUpdate: (workTime: Task['workTime']) => void;
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const TimeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TimeInput = styled.input`
  width: 80px;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-align: right;
`;

const Button = styled.button<{ isRunning?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, isRunning }) => 
    isRunning ? theme.colors.warning : theme.colors.primary};
  color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const TimerDisplay = styled.div`
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const WorkTimeManager: React.FC<WorkTimeManagerProps> = ({ task, onUpdate }) => {
  const [estimatedTime, setEstimatedTime] = useState(task.workTime?.estimated || 0);
  const [actualTime, setActualTime] = useState(task.workTime?.actual || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStartStop = () => {
    if (isRunning) {
      // 停止時の処理
      setIsRunning(false);
      if (startTime) {
        const now = new Date();
        const additionalTime = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
        const newActualTime = actualTime + additionalTime;
        setActualTime(newActualTime);
        onUpdate({
          estimated: estimatedTime,
          actual: newActualTime
        });
      }
    } else {
      // 開始時の処理
      setIsRunning(true);
      setStartTime(new Date());
    }
  };

  const handleEstimatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEstimatedTime(value);
    onUpdate({
      estimated: value,
      actual: actualTime
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <TimeDisplay>
        <div>
          <label>予定時間（分）: </label>
          <TimeInput
            type="number"
            value={estimatedTime}
            onChange={handleEstimatedChange}
            min="0"
          />
        </div>
        <div>
          <label>実績時間: </label>
          <span>{actualTime}分</span>
        </div>
      </TimeDisplay>

      {isRunning && (
        <TimerDisplay>
          {formatTime(elapsedTime)}
        </TimerDisplay>
      )}

      <Button
        isRunning={isRunning}
        onClick={handleStartStop}
      >
        {isRunning ? '停止' : '開始'}
      </Button>
    </Container>
  );
}; 