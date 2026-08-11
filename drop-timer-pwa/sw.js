const CACHE_NAME = 'drop-timer-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});

// 알림 액션 버튼 처리: 앱을 열지 않고도 시작/체크/중지를 실행할 수 있도록
// 이미 열려있는 탭(클라이언트)에 메시지를 보내서 실행시킴.
self.addEventListener('notificationclick', (event) => {
  const action = event.action; // 'check' | 'stop' | '' (본문 클릭)
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        client.postMessage({ type: 'notification-action', action: action || 'open' });
        return client.focus ? client.focus().catch(() => {}) : null;
      }
      // 열려있는 탭이 없으면 새로 열기 (이 경우 타이머 상태는 새로 시작됨)
      return self.clients.openWindow('./index.html');
    })
  );
});
