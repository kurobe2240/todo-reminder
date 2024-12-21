jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
  addNotificationRequest: jest.fn(),
  removePendingNotificationRequests: jest.fn(),
  removeAllPendingNotificationRequests: jest.fn(),
})); 