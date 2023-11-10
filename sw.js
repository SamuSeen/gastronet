importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({
    debug: false,
});

workbox.core.setCacheNameDetails({
    prefix: "",
    suffix: "",
});

workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst()
);

self.addEventListener('push', (event) => {
    let notification = event.data.json();
    self.registration.showNotification(
        notification.title,
        notification.options
    );
});
