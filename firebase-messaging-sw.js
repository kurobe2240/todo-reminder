importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // Firebaseの設定情報をここに追加
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    silent: false,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});