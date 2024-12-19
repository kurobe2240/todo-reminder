self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

// プッシュ通知のイベントリスナー
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: data.tag,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: '開く'
          },
          {
            action: 'close',
            title: '閉じる'
          }
        ]
      })
    );
  }
});

// メッセージイベントの処理
self.addEventListener('message', async (event) => {
  console.log('Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, message, tag } = event.data;
    
    try {
      // 通知を表示
      await self.registration.showNotification(title, {
        body: message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: tag || Date.now().toString(),
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,
        renotify: true,
        data: {
          timestamp: Date.now(),
          tag: tag
        },
        actions: [
          {
            action: 'open',
            title: '開く'
          },
          {
            action: 'close',
            title: '閉じる'
          }
        ]
      });
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
      // エラーが発生した場合は、フォールバックとして直接通知を試みる
      try {
        new Notification(title, {
          body: message,
          icon: '/logo192.png',
          tag: tag || Date.now().toString(),
          requireInteraction: true,
          silent: false
        });
      } catch (fallbackError) {
        console.error('フォールバック通知の表示にも失敗しました:', fallbackError);
      }
    }
  }
});

// 通知クリックイベントの処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('/');
      })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 