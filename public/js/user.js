//push logic
const VAPID_PUBLIC_KEY = "BCPYdPfs5I-sK0ePZb1NYkb59WMD9bl2WDufHmqBgT9Bppkdnrt7fnQKt8sThE-WJeSf8BHTIgmmKh7ysqn-mvk";

async function registerServiceWorker() {
    await navigator.serviceWorker.register('./sw.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
}

async function unregisterServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.unregister();
}

async function subscribeToPush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    try {
        const responseData = await postToServer('/add-subscription', {
            uid: document.getElementById("uidText").value,
            subscription,
            vapidPublicKey: VAPID_PUBLIC_KEY
        });
        console.log('Server response:', responseData);
        // handle the response as needed
    } catch (error) {
        // handle the error, if needed
        console.error('Failed to post to server:', error);
    }
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer("/remove-subscription", {
    endpoint: subscription,
    //uid: getCookie("uid")
  });
  await subscription.unsubscribe();
}


async function notifyMe() {//zmienić na konkretne zapytanie
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    //postToServer('/notify-me', { endpoint: subscription.endpoint });
    postToServer('/notify-me', { uid: getCookie("uid") });
    //console.log("UID:", uid);
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



//Loging in logging out logic
var loginPopup = document.getElementById("loginPopup");
function showLoginPopup() {
    loginPopup.hidden=false
}
function closeLoginPopup() {
    loginPopup.hidden=true
}

function registerUser() {
    var uidText = document.getElementById("uidText").value;
    
    setCookie("uid",uidText,365);
    subscribeToPush();
    console.log("Registered phone login:", uidText);
    notifyMe();
    closeLoginPopup();
    updateLogin();
}

function logoutUser() {
    removeCookie("uid");
    unsubscribeFromPush();
    updateLogin()
}

function updateLogin() {
    const user = getCookie("uid");

    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    if (user!==null) {
        loginLink.hidden = true;
        logoutLink.hidden = false;
    } else {
        loginLink.hidden = false;
        logoutLink.hidden = true;
    }
}

function init() {
    registerServiceWorker();
    updateLogin()
}

window.onload = init;