import NotificationService, { SoundType, NotificationService as NotificationServiceClass } from '../NotificationService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

jest.mock('@react-native-community/push-notification-ios', () => ({
  requestPermissions: jest.fn(),
  addEventListener: jest.fn(),
  addNotificationRequest: jest.fn(),
  removePendingNotificationRequests: jest.fn(),
  removeAllPendingNotificationRequests: jest.fn(),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request permissions on initialization', () => {
    new NotificationServiceClass();
    
    expect(PushNotificationIOS.requestPermissions).toHaveBeenCalledWith({
      alert: true,
      badge: true,
      sound: true,
    });
  });

  it('should schedule notification with default sound', () => {
    const date = new Date();
    NotificationService.scheduleNotification(
      'test-id',
      'Test Task',
      date
    );

    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-id',
        title: 'TODOリマインダー',
        sound: 'default',
      })
    );
  });

  it('should schedule notification with custom sound', () => {
    const date = new Date();
    const soundType: SoundType = 'tri-tone';
    
    NotificationService.scheduleNotification(
      'test-id',
      'Test Task',
      date,
      undefined,
      soundType
    );

    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-id',
        title: 'TODOリマインダー',
        sound: 'tri-tone',
      })
    );
  });

  it('should cancel specific notification', () => {
    NotificationService.cancelNotification('test-id');
    expect(PushNotificationIOS.removePendingNotificationRequests).toHaveBeenCalledWith(['test-id']);
  });

  it('should cancel all notifications', () => {
    NotificationService.cancelAllNotifications();
    expect(PushNotificationIOS.removeAllPendingNotificationRequests).toHaveBeenCalled();
  });

  it('should play sound preview', () => {
    const soundType: SoundType = 'aurora';
    NotificationService.playSound(soundType);

    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sound-preview',
        title: 'サウンドプレビュー',
        sound: 'aurora',
      })
    );
  });
}); 