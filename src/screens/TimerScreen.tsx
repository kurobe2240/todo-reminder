import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatTime } from '../utils/timeUtils';
import { TimerSettings } from '../components/TimerSettings';
import { TaskList } from '../components/TaskList';
import { notification } from '../services/notification';
import { storage } from '../services/storage';
import { TimerPhase, TimerSettings as ITimerSettings } from '../types/timer';

const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #FFF0F5;
  gap: 20px;
`;

const TimerCard = styled.div`
  background-color: white;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(255, 105, 180, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  width: 100%;
`;

const PhaseIndicator = styled.div<{ phase: TimerPhase }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.phase === 'work' ? '#FF69B4' : '#87CEEB'};
  margin-bottom: 10px;
`;

const TimeDisplay = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #FF69B4;
  margin: 20px 0;
  font-family: 'Digital-7', monospace;
`;

const SubTimeDisplay = styled.div`
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#FF69B4';
      case 'secondary': return '#87CEEB';
      case 'danger': return '#FF6B6B';
      default: return '#FF69B4';
    }
  }};
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TimerScreen: React.FC = () => {
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTimeLeft, setTotalTimeLeft] = useState(25 * 60);
  const [nextBreakIn, setNextBreakIn] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [settings, setSettings] = useState<ITimerSettings>({
    totalWorkTime: 25 * 60,
    breakInterval: 25 * 60,
    breakDuration: 5 * 60,
    autoStartAfterBreak: true,
    soundEnabled: true,
  });

  useEffect(() => {
    const savedSettings = storage.getCurrentSettings();
    if (savedSettings) {
      setSettings(savedSettings);
      setTimeLeft(savedSettings.totalWorkTime);
      setTotalTimeLeft(savedSettings.totalWorkTime);
      setNextBreakIn(savedSettings.breakInterval);
    }

    notification.requestPermission();
  }, []);

  useEffect(() => {
    let timer: number;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // 作業中の場合
          if (phase === 'work') {
            setTotalTimeLeft(prev => prev - 1);
            setNextBreakIn(prev => {
              const newBreakIn = prev - 1;
              if (newBreakIn === 0) {
                handleBreakStart();
                return settings.breakInterval;
              }
              return newBreakIn;
            });
          }

          // タイマー終了時の処理
          if (newTime === 0) {
            if (phase === 'work') {
              handleBreakStart();
            } else {
              handleWorkStart();
            }
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, phase, settings]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(settings.totalWorkTime);
    setTotalTimeLeft(settings.totalWorkTime);
    setNextBreakIn(settings.breakInterval);
  };

  const handleBreakStart = () => {
    if (settings.soundEnabled) {
      notification.showBreakNotification(settings.breakDuration);
    }
    setPhase('break');
    setTimeLeft(settings.breakDuration);
    setIsRunning(settings.autoStartAfterBreak);
  };

  const handleWorkStart = () => {
    if (settings.soundEnabled) {
      notification.showWorkNotification();
    }
    setPhase('work');
    setTimeLeft(settings.breakInterval);
    setIsRunning(settings.autoStartAfterBreak);
  };

  const handleEnd = () => {
    setShowEndConfirm(true);
  };

  const confirmEnd = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(settings.totalWorkTime);
    setTotalTimeLeft(settings.totalWorkTime);
    setNextBreakIn(settings.breakInterval);
    setShowEndConfirm(false);
  };

  const handleSettingsSave = (newSettings: ITimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    handleReset();
  };

  return (
    <ScreenContainer>
      <TimerCard>
        <PhaseIndicator phase={phase}>
          {phase === 'work' ? '作業中' : '休憩中'}
        </PhaseIndicator>
        <TimeDisplay>{formatTime(timeLeft)}</TimeDisplay>
        {phase === 'work' && (
          <>
            <SubTimeDisplay>
              総残り時間: {formatTime(totalTimeLeft)}
            </SubTimeDisplay>
            <SubTimeDisplay>
              次の休憩まで: {formatTime(nextBreakIn)}
            </SubTimeDisplay>
          </>
        )}
        <ButtonContainer>
          {!isRunning ? (
            <Button variant="primary" onClick={handleStart}>
              スタート
            </Button>
          ) : (
            <Button variant="secondary" onClick={handlePause}>
              一時停止
            </Button>
          )}
          <Button onClick={handleReset}>
            リセット
          </Button>
          <Button variant="danger" onClick={handleEnd}>
            終了
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            設定
          </Button>
        </ButtonContainer>
      </TimerCard>

      <TaskList />

      {showSettings && (
        <Modal>
          <TimerSettings
            onSave={handleSettingsSave}
            onClose={() => setShowSettings(false)}
          />
        </Modal>
      )}

      {showEndConfirm && (
        <Modal>
          <TimerCard>
            <h3>作業を終了しますか？</h3>
            <ButtonContainer>
              <Button variant="danger" onClick={confirmEnd}>
                終了する
              </Button>
              <Button onClick={() => setShowEndConfirm(false)}>
                キャンセル
              </Button>
            </ButtonContainer>
          </TimerCard>
        </Modal>
      )}
    </ScreenContainer>
  );
};

export default TimerScreen; 