// Змінити версію щоб примусово оновити кеш після деплою
const CACHE = 'dn-cache-v6';

// Що кешуємо при першому відкритті
const PRECACHE = [
  './',
  'manifest.json',
  'icons/favicon.ico',
  'icons/favicon.svg',
  'icons/favicon-96x96.png',
  'icons/apple-touch-icon.png',
  'icons/web-app-manifest-192x192.png',
  'icons/web-app-manifest-512x512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Видаляємо старі версії кешу
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first: спочатку кеш, мережа тільки якщо немає
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(response => {
          // Кешуємо нові запити на льоту
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
      )
  );
});
