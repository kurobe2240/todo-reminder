const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
  '/todo-reminder/',
  '/todo-reminder/index.html',
  '/todo-reminder/manifest.json',
  '/todo-reminder/favicon.ico',
  '/todo-reminder/logo192.png',
  '/todo-reminder/logo512.png',
  '/todo-reminder/notification.mp3',
  '/todo-reminder/static/js/main.js',
  '/todo-reminder/static/css/main.css'
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // クライアントの制御を即座に取得
      clients.claim()
    ])
  );
});

// プッシュ通知を受信したときの処理
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.description || '',
      icon: '/todo-reminder/logo192.png',
      badge: '/todo-reminder/favicon.ico',
      tag: data.id,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      sound: '/todo-reminder/notification.mp3',
      actions: [
        {
          action: 'open',
          title: '開く'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ],
      data: data
    };

    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title, options),
        // 通知音を再生
        fetch('/todo-reminder/notification.mp3')
          .then(response => response.blob())
          .then(blob => {
            const audio = new Audio(URL.createObjectURL(blob));
            return audio.play().catch(error => {
              console.error('通知音の再生に失敗しました:', error);
            });
          })
          .catch(error => {
            console.error('通知音ファイルの読み込みに失敗しました:', error);
          })
      ])
    );
  }
});

// 通知がクリックされたときの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = new URL('/todo-reminder/', self.location.origin).href;

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((windowClients) => {
        // すでに開いているウィンドウがあれば、そこにフォーカス
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 新しいウィンドウを開く
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

// フェッチ時のキャッシュ戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        return new Response('オフラインです。インターネット接続を確認してください。');
      })
  );
}); 