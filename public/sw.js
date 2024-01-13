importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
/**
 * Wersja cache, aktualizować za każdą zmianą strony
 */
const cacheVersion = "015";

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
    new workbox.strategies.NetworkFirst({
        cacheName: "site-cache",
    })
);

/**
 * precaching w trakcie installacji service-workera
 */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
        return cache.addAll([
            "/index.html",
            "/cart.html",
            "/endorder.html",
            "/main.html",
            "/notifications.html",
            "/manifest.json",
            "/css/endorder.css",
            "/css/style.css",
            "/js/app.js",
            "/js/cookies.js",
            "/js/notifications.js",
            "/js/push.js",
            "/js/user.js",
            "/images/625230.png",
            "/images/625231.png",
            "/images/burger1.jpg",
            "/images/burger2.jpg",
            "/images/burger3.jpg",
            "/images/burger4.jpg",
            "/images/cola.jpg",
            "/images/coleslaw1.jpg",
            "/images/fries1.jpg",
            "/images/lunchspecial1.jpg",
            "/images/meal42.jpg",
            "/images/pepsi.jpg",
            "/images/sprite.jpg",
            "/images/wrap1.jpg",
            "/images/wrap2.jpg",
            "/images/wrap3.jpg",
            "/logo.jpg",
            "/product.xml"
        ]);
        })
    );
});

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

