import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// iOSのシステム標準サウンド
export type SoundType = 'default' | 'tri-tone' | 'note' | 'aurora';

export interface NotificationInfo {
  id: string;
  title: string;
  body: string;
  date: Date;
  repeatType?: string;
  soundType: SoundType;
}

export interface ScheduleNotificationParams {
  id: string;
  title: string;
  body: string;
  date: Date;
  repeatType?: string;
  soundType?: SoundType;
}

export class NotificationService {
  private sounds: Record<SoundType, string> = {
    default: 'default',
    'tri-tone': 'tri-tone',  // 標準的な通知音
    note: 'note',            // 短い音
    aurora: 'aurora',        // メロディアスな音
  };

  constructor() {
    this.configure();
  }

  configure = () => {
    PushNotificationIOS.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
    });

    PushNotificationIOS.addEventListener('localNotification', (notification) => {
      console.log('LOCAL NOTIFICATION:', notification);
    });
  };

  scheduleNotification = (params: ScheduleNotificationParams) => {
    const { id, title, body, date, repeatType, soundType = 'default' } = params;
    const formattedDate = format(date, 'M月d日 HH:mm', { locale: ja });
    
    // 繰り返し間隔の設定
    let repeatsComponent: { day?: boolean } | undefined;
    switch (repeatType) {
      case 'day':
        repeatsComponent = { day: true };
        break;
      case 'week':
        repeatsComponent = { day: true }; // 7日ごと
        break;
      case 'month':
        repeatsComponent = { day: true }; // 30日ごと
        break;
      default:
        repeatsComponent = undefined;
    }

    PushNotificationIOS.addNotificationRequest({
      id,
      title: 'TODOリマインダー',
      body: `${title}\n${body}\n予定日時: ${formattedDate}`,
      fireDate: date,
      repeats: !!repeatsComponent,
      repeatsComponent,
      sound: this.sounds[soundType],
      userInfo: { id, title, repeatType, soundType },
    });
  };

  cancelNotification = (id: string) => {
    PushNotificationIOS.removePendingNotificationRequests([id]);
  };

  cancelAllNotifications = () => {
    PushNotificationIOS.removeAllPendingNotificationRequests();
  };

  // 通知音のプレビュー用
  playSound = (soundType: SoundType) => {
    PushNotificationIOS.addNotificationRequest({
      id: 'sound-preview',
      title: 'サウンドプレビュー',
      body: `${soundType}の音をテスト再生`,
      fireDate: new Date(Date.now() + 1000),
      sound: this.sounds[soundType],
    });
  };

  // 予定されている通知の一覧を取得
  getPendingNotifications = async (): Promise<NotificationInfo[]> => {
    return new Promise((resolve) => {
      PushNotificationIOS.getPendingNotificationRequests((notifications) => {
        const notificationInfos = notifications
          .filter((notification) => notification.id !== 'sound-preview')
          .map((notification) => ({
            id: notification.id,
            title: notification.title || '',
            body: notification.body || '',
            date: new Date(notification.fireDate || Date.now()),
            repeatType: notification.userInfo?.repeatType,
            soundType: (notification.userInfo?.soundType || 'default') as SoundType,
          }));
        resolve(notificationInfos);
      });
    });
  };

  // バッジ数の更新
  updateBadgeCount = async () => {
    const notifications = await this.getPendingNotifications();
    PushNotificationIOS.setApplicationIconBadgeNumber(notifications.length);
  };
}

export default new NotificationService(); 