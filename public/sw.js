importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
/**
 * Wersja cache, aktualizować za każdą zmianą strony
 */
const cacheVersion = "012";

/**
 * ustawienia sw
 */
workbox.setConfig({
    debug: false,
});

/**
 * konfiguracja nazwy cache
 */
workbox.core.setCacheNameDetails({
    prefix: "gastronet-",
    suffix: "-v" + cacheVersion,
});

/**
 * Cachuje wszystko a ładuje w pierwszej kolejności z cache
 */
workbox.routing.setDefaultHandler(
    new workbox.strategies.CacheFirst({
        cacheName: "site-cache",
    })
);

/**
 * Media cache
 */
/*workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|webp|ico)$/i,//typy plików
    new workbox.strategies.CacheFirst({
        cacheName: "media-cache",
        plugins: [
        new workbox.expiration.ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, //30 dni w sekundach
        }),
        ],
    })
);*/

/**
 * Usuwa stare cache
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith('gastronet-') && !cacheName.includes(cacheVersion)) {//jeśli nie ma dobrej wersji
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


/**
 * Wyświetlanie powiadomienia
 */
self.addEventListener('push', (event) => {
    const payload = event.data.json() || { title: "Default Title", body: "Default Body" };

    const notificationOptions = {
        title: payload.title || "Test",
        body: payload.body || "",
        icon: payload.icon || "./icons/favicon.ico",
        badge: payload.badge || null,
        image: payload.image || null,
        vibrate: payload.vibrate || [200, 100, 200],
        data: payload.data || null,
        actions: Array.isArray(payload.actions) ? payload.actions : [],
    };

    event.waitUntil(
        self.registration.showNotification(notificationOptions.title, notificationOptions)
    );
});

