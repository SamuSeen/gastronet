importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const cacheVersion = "004";

workbox.setConfig({
    debug: false,
});

workbox.core.setCacheNameDetails({
    prefix: "gastronet-",
    suffix: "-v"+cacheVersion,
});

// Cache all types of requests using CacheFirst strategy
workbox.routing.setDefaultHandler(
    new workbox.strategies.CacheFirst({
        cacheName: "site-cache",
    })
);

// Cache images separately using CacheFirst strategy
workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
        cacheName: "image-cache",
    })
);

self.addEventListener('push', (event) => {
    const payload = event.data.json() || { title: "Default Title", body: "Default Body" };
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: "./icons/favicon.ico"
        })
    );
});