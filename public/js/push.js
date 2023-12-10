//Service worker
const VAPID_PUBLIC_KEY = "BCPYdPfs5I-sK0ePZb1NYkb59WMD9bl2WDufHmqBgT9Bppkdnrt7fnQKt8sThE-WJeSf8BHTIgmmKh7ysqn-mvk";
//Regenerate VAPID keys
//Checks for notification permissions
/*Notification.requestPermission()
    .then(permission => {
        if (permission === 'granted') {
            console.log('Permission for notifications was granted'); }
        else {
            console.error('Permission for notifications was denied'); }
        });*/
//show registered service workers
/*navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(registrations);
});*/



/* Push notification logic. */
async function registerServiceWorker() {
    await navigator.serviceWorker.register('./sw.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
    updateUI();
}

async function unregisterServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.unregister();
    updateUI();
}

async function subscribeToPush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    try {
        const responseData = await postToServer('/add-subscription', {
            subscription,
            vapidPublicKey: VAPID_PUBLIC_KEY
        });
        console.log('Server response:', responseData);
        // handle the response as needed
    } catch (error) {
        // handle the error, if needed
        console.error('Failed to post to server:', error);
    updateUI();
}
    /*const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    try {
        const responseData = await postToServer('/add-subscription', subscription);
        console.log('Server response:', responseData);
        // handle the response as needed
    } catch (error) {
        // handle the error, if needed
        console.error('Failed to post to server:', error);
    }
    updateUI();*/
}

async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer('/remove-subscription', {
        endpoint: subscription.endpoint
    });
    await subscription.unsubscribe();
    updateUI();
}

async function notifyMe() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer('/notify-me', { endpoint: subscription.endpoint });
}

async function notifyAll() {
    const response = await fetch('/notify-all', {
        method: 'POST'
    });
    if (response.status === 409) {
        document.getElementById('notification-status-message').textContent =
            'There are no subscribed endpoints to send messages to, yet.';
    }
}

/* UI logic. */

async function updateUI() {
    const registrationButton = document.getElementById('register');
    const unregistrationButton = document.getElementById('unregister');
    const registrationStatus = document.getElementById('registration-status-message');
    const subscriptionButton = document.getElementById('subscribe');
    const unsubscriptionButton = document.getElementById('unsubscribe');
    const subscriptionStatus = document.getElementById('subscription-status-message');
    const notifyMeButton = document.getElementById('notify-me');
    const notificationStatus = document.getElementById('notification-status-message');
    registrationButton.disabled = true;
    unregistrationButton.disabled = true;
    subscriptionButton.disabled = true;
    unsubscriptionButton.disabled = true;
    notifyMeButton.disabled = true;
    // Service worker is not supported so we can't go any further.
    if (!'serviceWorker' in navigator) {
    //if (navigator.serviceWorker.getRegistrations() === undefined) {
        registrationStatus.textContent = "This browser doesn't support service workers.";
        subscriptionStatus.textContent = "Push subscription on this client isn't possible because of lack of service worker support.";
        notificationStatus.textContent = "Push notification to this client isn't possible because of lack of service worker support.";
        return;
    }
    const registration = await navigator.serviceWorker.getRegistration(); 
    // Service worker is available and now we need to register one.
    if (!registration) {
        registrationButton.disabled = false;
        registrationStatus.textContent = 'No service worker has been registered yet.';
        subscriptionStatus.textContent = "Push subscription on this client isn't possible until a service worker is registered.";
        notificationStatus.textContent = "Push notification to this client isn't possible until a service worker is registered.";
        return;
    }
    registrationStatus.textContent =
        `Service worker registered. Scope: ${registration.scope}`;
    const subscription = await registration.pushManager.getSubscription();
    // Service worker is registered and now we need to subscribe for push
    // or unregister the existing service worker.
    if (!subscription) {
        unregistrationButton.disabled = false;
        subscriptionButton.disabled = false;
        subscriptionStatus.textContent = 'Ready to subscribe this client to push.';
        notificationStatus.textContent = 'Push notification to this client will be possible once subscribed.';
        return;
    }
    // Service worker is registered and subscribed for push and now we need
    // to unregister service worker, unsubscribe to push, or send notifications.
    subscriptionStatus.textContent =
        `Service worker subscribed to push. Endpoint: ${subscription.endpoint}`;
    notificationStatus.textContent = 'Ready to send a push notification to this client!';
    unregistrationButton.disabled = false;
    notifyMeButton.disabled = false;
    unsubscriptionButton.disabled = false;
}

/* Utility functions. */

//convert a base64 string to Uint8Array for server.
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        buffer[i] = rawData.charCodeAt(i);
    }
    return buffer;
}

//send to server
/*async function postToServer(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error posting to server:', error);
        throw error; // rethrow the error to be caught by the caller if needed
    }
}*/
async function postToServer(url, data) {
    try {
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        });

        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log("Server response:", responseText);

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error("Error posting to server:", error);
        throw error; // rethrow the error to be caught by the caller if needed
    }
}

window.onload = registerServiceWorker;

console.log('VAPID public key:', urlB64ToUint8Array(VAPID_PUBLIC_KEY));
/*if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(swReg => {
            console.log('Service worker Registered')
            updateUI();
        });
} else {
    console.warn('Service workers aren\'t supported in this browser.');
}*/
