

//Service worker
const VAPID_PUBLIC_KEY = 'BHKnEUIn2lpOowyM4DG9qv96Cxz-jaNHxmpxTw4XowvXxU4Wzl4ThSDCyljYeRyyVBWfJmRByMR5UY2UeuPBRV0';

/* Push notification logic. */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(swReg => {
            console.log('Service worker Registered')
            updateUI();
        });
} else {
    console.warn('Service workers aren\'t supported in this browser.');
}

async function registerServiceWorker() {
    await navigator.serviceWorker.register('./js/sw.js');
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
    postToServer('/add-subscription', subscription);
    updateUI();
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
    // Disable all buttons by default.
    registrationButton.disabled = true;
    unregistrationButton.disabled = true;
    subscriptionButton.disabled = true;
    unsubscriptionButton.disabled = true;
    notifyMeButton.disabled = true;
    // Service worker is not supported so we can't go any further.
    if (!'serviceWorker' in navigator) {
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

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

async function postToServer(url, data) {
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

window.onload = updateUI;


//Lokalizacja
//function that gets the location and returns it
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geo Location not supported by browser");
    }
}
//function that retrieves the position
function showPosition(position) {
    var location = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
    }
    console.log(location)
}
//request for location
getLocation();

//Menu
function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", filename, false);
    try {
        xhttp.responseType = "msxml-document";
    } catch (err) { } // Helping IE11
    xhttp.send("");
    return xhttp.responseXML;
}

function showProducts(category) {
    const productsContainer = document.getElementById('products');
    let productsHTML = '';

    const xmlDoc = loadXMLDoc("product.xml"); // Załaduj plik XML

    const products = xmlDoc.getElementsByTagName('product');

    for (let i = 0; i < products.length; i++) {
        const categoryType = products[i].parentNode.getAttribute('name');
        if (categoryType === category || category === 'all') {
            const name = products[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
            const description = products[i].getElementsByTagName('description')[0].childNodes[0].nodeValue;
            const price = products[i].getElementsByTagName('price')[0].childNodes[0].nodeValue;
            const image = products[i].getElementsByTagName('image')[0].childNodes[0].nodeValue;

            productsHTML += `
                    <div class="product">
                        <img src="images/${image}" alt="${name}">
                        <div>
                            <h3>${name}</h3>
                            <p>Description: ${description}</p>
                            <p>Price: ${price} PLN</p>
                            <button>Add to Cart</button>
                        </div>
                    </div>
                `;
        }
    }

    productsContainer.innerHTML = productsHTML;
}