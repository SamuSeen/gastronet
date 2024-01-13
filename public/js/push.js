//Service worker
const VAPID_PUBLIC_KEY = "BCPYdPfs5I-sK0ePZb1NYkb59WMD9bl2WDufHmqBgT9Bppkdnrt7fnQKt8sThE-WJeSf8BHTIgmmKh7ysqn-mvk";

/**
 * Does all the steps of user registration
 */
function registerUser() {
    setCookie("uid",document.getElementById("uidText").value,30);
    subscribeToPush();
    updateUI();
}

/**
 * remove user and unsubscribe
 */
function removeUser() {
    removeCookie("uid");
    unsubscribeFromPush();
    updateUI();
}

/**
 * Unsubscribe if no user
 */
function checkLogin() {
    if(!getCookie("uid")){
        unsubscribeFromPush()
        updateUI()
    }
}

// Push notification logic.
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

/**
 * Remove SW
 */
async function unregisterServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.unregister();
    updateUI();
}

/**
 * Wysyła rejestrację push na serwer
 */
async function subscribeToPush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    try {
        const responseData = await postToServer('/add-subscription', {
            uid: getCookie("uid"),
            subscription,
            vapidPublicKey: VAPID_PUBLIC_KEY
        });
        console.log('Server response:', responseData);
    } catch (error) {
        console.error('Failed to post to server:', error);
    }
    updateUI();
}

/**
 * Wysyła żądanie o usunięcie subskrypcji
 * todo usuwanie wszystkich subskrypcji usera
 */
async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer("/remove-subscription", {
        subscription: subscription.endpoint
        //uid: getCookie("uid")
    });
    await subscription.unsubscribe();
    updateUI()
}

/**
 * Żąda przykładowego powiadomienia dla użytkownika
 */
async function notifyMe() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    postToServer('/notify-me', { uid: getCookie("uid") });
    //console.log("UID:", uid);
}

/**
 * Żąda wysłania powiadomienia do wszystkich użytkowników
 */
async function notifyAll() {
    const response = await fetch('/notify-all', {
        method: 'POST'
    });
    if (response.status === 409) {
        document.getElementById('notification-status-message').textContent =
            'There are no subscribed endpoints to send messages to, yet.';
    }
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

/**
 * Wysyła dane do serwera
 * @param {*} url komenda jaką ma przetworzyć serwer przez app.post
 * @param {*} data payload
 * @returns odpowiedź serwera
 */
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
        // Sprawdzanie typu odpowiedzi
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const responseData = await response.json();
            console.log("Server response:", responseData);
            return responseData;
        } else {
            const responseText = await response.text();
            console.log("Server response:", responseText);
            return responseText;
        }
    } catch (error) {
        console.error("Error posting to server:", error);
        throw error;
    }
}

/**
 * inicjalizacjia
 */
function init() {
    registerServiceWorker();
    updateUI();
    checkLogin();
}
window.onload = init;