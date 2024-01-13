document.head.appendChild(
    Object.assign(document.createElement("script"), { src: "js/push.js" })
);

async function updateUI(){
    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const uidField = document.getElementById("uidText");
    const registrationButton = document.getElementById("register");
    const unregistrationButton = document.getElementById("unregister");
    const registrationStatus = document.getElementById(
        "registration-status-message"
    );
    const subscriptionButton = document.getElementById("subscribe");
    const unsubscriptionButton = document.getElementById("unsubscribe");
    const subscriptionStatus = document.getElementById(
        "subscription-status-message"
    );
    const notifyMeButton = document.getElementById("notify-me");
    const notificationStatus = document.getElementById(
        "notification-status-message"
    );
    // Disable all buttons by default.
    registrationButton.disabled = true;
    unregistrationButton.disabled = true;
    subscriptionButton.disabled = true;
    unsubscriptionButton.disabled = true;
    notifyMeButton.disabled = true;
    // loginButton.disabled = false;
    // logoutButton.disabled = true;
    // uidField.disabled = true;
    //check if user is set
    if (getCookie("uid") == null) {
        loginButton.disabled = false;
        logoutButton.disabled = true;
        uidField.disabled = false;
    } else {
        loginButton.disabled = true;
        logoutButton.disabled = false;
        uidField.disabled = true;
        uidField.value = getCookie("uid");
    }
    // Service worker is not supported so we can't go any further.
    if (!"serviceWorker" in navigator) {
        //if (navigator.serviceWorker.getRegistrations() === undefined) {
        registrationStatus.textContent =
        "This browser doesn't support service workers.";
        subscriptionStatus.textContent =
        "Push subscription on this client isn't possible because of lack of service worker support.";
        notificationStatus.textContent =
        "Push notification to this client isn't possible because of lack of service worker support.";
        return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    // Service worker is available and now we need to register one.
    if (!registration) {
        registrationButton.disabled = false;
        registrationStatus.textContent =
        "No service worker has been registered yet.";
        subscriptionStatus.textContent =
        "Push subscription on this client isn't possible until a service worker is registered.";
        notificationStatus.textContent =
        "Push notification to this client isn't possible until a service worker is registered.";
        return;
    }
    registrationStatus.textContent = `Service worker registered. Scope: ${registration.scope}`;
    const subscription = await registration.pushManager.getSubscription();
    // Service worker is registered and now we need to subscribe for push
    // or unregister the existing service worker.
    if (!subscription) {
        unregistrationButton.disabled = false;
        subscriptionButton.disabled = false;
        subscriptionStatus.textContent = "Ready to subscribe this client to push.";
        notificationStatus.textContent =
        "Push notification to this client will be possible once subscribed.";
        return;
    }
    // Service worker is registered and subscribed for push and now we need
    // to unregister service worker, unsubscribe to push, or send notifications.
    subscriptionStatus.textContent = `Service worker subscribed to push. Endpoint: ${subscription.endpoint}`;
    notificationStatus.textContent =
        "Ready to send a push notification to this client!";
    unregistrationButton.disabled = false;
    notifyMeButton.disabled = false;
    unsubscriptionButton.disabled = false;
    }
    /* Utility functions. */
    //convert a base64 string to Uint8Array for server.
    function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
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
