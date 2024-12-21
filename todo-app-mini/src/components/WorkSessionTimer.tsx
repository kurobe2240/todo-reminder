import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useWorkSessionStore } from '../store/workSessionStore';
import NotificationService from '../services/NotificationService';

declare global {
  namespace NodeJS {
    interface Global {
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      setInterval: typeof setInterval;
      clearInterval: typeof clearInterval;
    }
    type Timeout = ReturnType<typeof setTimeout>;
  }
}

const WorkSessionTimer: React.FC = () => {
  const {
    settings,
    currentSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startBreak,
    endBreak,
  } = useWorkSessionStore();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextBreakIn, setNextBreakIn] = useState<number>(0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}時間` : ''}${mins}分`;
  };

  const scheduleBreakNotification = useCallback(() => {
    if (currentSession && settings.soundEnabled) {
      const now = new Date();
      const nextBreakTime = new Date(
        now.getTime() + settings.breakInterval * 60000
      );

      NotificationService.scheduleNotification({
        id: `break_${currentSession.id}_${Date.now()}`,
        title: '休憩時間です',
        body: `${formatTime(settings.breakDuration)}の休憩を取りましょう`,
        date: nextBreakTime,
        soundType: 'default',
      });
    }
  }, [currentSession, settings, formatTime]);

  const scheduleWorkNotification = useCallback(() => {
    if (currentSession && settings.soundEnabled && settings.autoStart) {
      const now = new Date();
      const workStartTime = new Date(
        now.getTime() + settings.breakDuration * 60000
      );

      NotificationService.scheduleNotification({
        id: `work_${currentSession.id}_${Date.now()}`,
        title: '作業再開時間です',
        body: '休憩が終了しました。作業を再開しましょう。',
        date: workStartTime,
        soundType: 'default',
      });
    }
  }, [currentSession, settings]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (currentSession && !currentSession.isPaused) {
      timer = setInterval(() => {
        const now = new Date();
        if (currentSession.currentPhase === 'work') {
          // 作業中の場合
          const currentBreak = currentSession.breaks[currentSession.breaks.length - 1];
          const lastBreakEnd = currentBreak
            ? currentBreak.endTime
            : currentSession.startTime;
          const timeSinceLastBreak = Math.floor(
            (now.getTime() - lastBreakEnd.getTime()) / 60000
          );
          const nextBreak = settings.breakInterval - timeSinceLastBreak;
          setNextBreakIn(Math.max(0, nextBreak));

          if (nextBreak <= 0) {
            startBreak();
            scheduleWorkNotification();
          }
        } else {
          // 休憩中の場合
          const currentBreak = currentSession.breaks[currentSession.breaks.length - 1];
          const breakTimeLeft = Math.floor(
            (currentBreak.endTime.getTime() - now.getTime()) / 60000
          );

          if (breakTimeLeft <= 0 && settings.autoStart) {
            endBreak();
            scheduleBreakNotification();
          }
        }

        // 総残り時間の計算
        const timeLeftTotal = Math.floor(
          (currentSession.endTime.getTime() - now.getTime()) / 60000
        );
        setTimeLeft(Math.max(0, timeLeftTotal));

        if (timeLeftTotal <= 0) {
          endSession();
          Alert.alert('作業終了', '設定された作業時間が終了しました。');
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [currentSession, settings, startBreak, endBreak, endSession, scheduleWorkNotification, scheduleBreakNotification]);

  const handleStartSession = () => {
    startSession();
    scheduleBreakNotification();
  };

  const handleEndSession = () => {
    Alert.alert(
      '作業の終了',
      '現在の作業を終了しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '終了',
          style: 'destructive',
          onPress: () => {
            endSession();
            NotificationService.cancelAllNotifications();
          },
        },
      ],
    );
  };

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartSession}
        >
          <Text style={styles.startButtonText}>作業を開始</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.phaseText}>
          {currentSession.currentPhase === 'work' ? '作業中' : '休憩中'}
        </Text>
        <Text style={styles.timeLeftText}>残り {formatTime(timeLeft)}</Text>
        {currentSession.currentPhase === 'work' && (
          <Text style={styles.nextBreakText}>
            次の休憩まで {formatTime(nextBreakIn)}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {currentSession.isPaused ? (
          <TouchableOpacity
            style={[styles.button, styles.resumeButton]}
            onPress={resumeSession}
          >
            <Text style={styles.buttonText}>再開</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={pauseSession}
          >
            <Text style={styles.buttonText}>一時停止</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndSession}
        >
          <Text style={styles.buttonText}>終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  timeLeftText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextBreakText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WorkSessionTimer; 