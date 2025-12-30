// Service Worker для PWA
const CACHE_NAME = 'testing-system-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/config.js',
    '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кэширование файлов...');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    // Пропускаем API запросы
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/auth/')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем из кэша или делаем сетевой запрос
                return response || fetch(event.request)
                    .then(response => {
                        // Кэшируем только успешные ответы
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                        }
                        return response;
                    });
            })
            .catch(() => {
                // Фолбэк для offline режима
                if (event.request.url.endsWith('.html')) {
                    return caches.match('/index.html');
                }
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
    if (event.tag === 'sync-answers') {
        event.waitUntil(syncAnswers());
    }
});

async function syncAnswers() {
    // Здесь можно реализовать фоновую синхронизацию
    console.log('Фоновая синхронизация...');
}
