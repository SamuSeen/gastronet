//Service worker
//trying to implement push notifications, again
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(swReg => {
            console.log('Service worker Registered')
        });
} else {
    console.warn('Service workers aren\'t supported in this browser.');
}
if (!('showNotification' in swReg.prototype)) {
    console.warn('Notifications aren\'t supported.');
    return;
}
if (Notification.permission === 'denied') {
    console.warn('The user has blocked notifications.');
    return;
} if (!('PushManager' in window)) {
    console.warn('Push messaging isn\'t supported.');
    return;
}
/*if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('js/sw.js')
        .then((registration) => {
            return registration.pushManager
                .getSubscription()
                .then(async (subscription) => {
                    // registration part
                    async (subscription) => {
                        if (subscription) {
                            return subscription;
                        } else {
                            const response = await fetch("./vapidPublicKey");
                            const vapidPublicKey = await response.text();
                            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                            registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: convertedVapidKey,
                            });
                        }
                    };

                });
        })
        .then((subscription) => {
            // subscription part
            fetch("./register", {
                method: "post",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ subscription }),
            });
            document.getElementById("subscribe").onclick = () => {
                const payload = document.getElementById("notification-payload").value;
                const delay = document.getElementById("notification-delay").value;
                const ttl = document.getElementById("notification-ttl").value;

                fetch("./sendNotification", {
                    method: "post",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({
                        subscription,
                        payload,
                        delay,
                        ttl,
                    }),
                });
            };
        })
        .catch(() => console.log('service worker not registered'))
}*/

//Notifications ale chcemy Push
/*Notification.requestPermission().then((result) => {
    if (result === "granted") {
        randomNotification();
    }
});
function randomNotification() {
    const randomItem = Math.floor(Math.random() * games.length);
    const notifTitle = games[randomItem].name;
    const notifBody = `Created by ${games[randomItem].author}.`;
    const notifImg = `data/img/${games[randomItem].slug}.jpg`;
    const options = {
        body: notifBody,
        icon: notifImg,
    };
    new Notification(notifTitle, options);
    setTimeout(randomNotification, 30000);
}*/
/*const options = {
    'This is Message Body'
    //Here you can add more properties like icon, image, vibrate, etc.
};

swReg.showNotification('This is Message Title', options);*/
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