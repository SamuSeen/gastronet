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

/*self.addEventListener('push', (event) => {
    let notification = event.data.json();
    self.registration.showNotification(
        notification.title,
        notification.options
    );
});*/

// payload = {
//     body: "Service worker is now online",
// };

self.addEventListener("push", (event) => {
    const payload = event.data?.text() ?? "no payload";
    event.waitUntil(
        self.registration.showNotification({body: payload.title}, {
            body: payload.body,
        }),
    );
});