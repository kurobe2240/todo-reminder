importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebaseの設定
firebase.initializeApp({
  apiKey: "AIzaSyDTEzeop9bUBzNwDPiLcdBRcHknVkHn3VFzXXX",
  authDomain: "todo-reminder-77f9a.firebaseapp.com",
  projectId: "todo-reminder-77f9a",
  storageBucket: "todo-reminder-77f9a.firebasestore.com",
  messagingSenderId: "620556930396",
  appId: "1:620556930396:web:4f597430737944763385",
  measurementId: "G-P02xRECC7U"
});

const messaging = firebase.messaging();

// バックグラウンドでのメッセージ受信処理
messaging.onBackgroundMessage((payload) => {
  console.log('バックグラウンドメッセージを受信:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 