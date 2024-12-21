import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Task } from '../types/task';

interface PomodoroTimerProps {
  task?: Task;
  onWorkTimeUpdate?: (minutes: number) => void;
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const TimerDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.secondary : theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Settings = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SettingInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  task,
  onWorkTimeUpdate
}) => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workTimeAccumulated, setWorkTimeAccumulated] = useState(0);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  }, []);

  const switchMode = useCallback(() => {
    setIsBreak(!isBreak);
    setTimeLeft((isBreak ? workDuration : breakDuration) * 60);
    playNotificationSound();
  }, [isBreak, workDuration, breakDuration, playNotificationSound]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            switchMode();
            return (isBreak ? workDuration : breakDuration) * 60;
          }
          if (!isBreak) {
            setWorkTimeAccumulated((prev) => prev + 1/60);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration, switchMode]);

  useEffect(() => {
    if (onWorkTimeUpdate && workTimeAccumulated > 0) {
      onWorkTimeUpdate(Math.floor(workTimeAccumulated));
    }
  }, [workTimeAccumulated, onWorkTimeUpdate]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
    setWorkTimeAccumulated(0);
  };

  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setWorkDuration(value);
    if (!isRunning && !isBreak) {
      setTimeLeft(value * 60);
    }
  };

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setBreakDuration(value);
    if (!isRunning && isBreak) {
      setTimeLeft(value * 60);
    }
  };

  return (
    <Container>
      <Settings>
        <SettingInput>
          <Label>作業時間（分）</Label>
          <Input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={handleWorkDurationChange}
            disabled={isRunning}
          />
        </SettingInput>
        <SettingInput>
          <Label>休憩時間（分）</Label>
          <Input
            type="number"
            min="1"
            max="60"
            value={breakDuration}
            onChange={handleBreakDurationChange}
            disabled={isRunning}
          />
        </SettingInput>
      </Settings>

      <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>

      <ButtonGroup>
        {!isRunning ? (
          <Button onClick={handleStart}>開始</Button>
        ) : (
          <Button onClick={handlePause}>一時停止</Button>
        )}
        <Button variant="secondary" onClick={handleReset}>
          リセット
        </Button>
      </ButtonGroup>

      {task && (
        <div>
          <Label>累計作業時間: {Math.floor(workTimeAccumulated)}分</Label>
        </div>
      )}
    </Container>
  );
}; 