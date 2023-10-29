//Service worker
if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('service worker registered'))
        .catch(() => console.log('service worker not registered'))
    navigator.serviceWorker.getRegistration()
        .then(reg => {
            reg.pushManager.subscribe({
                userVisibleOnly: true
            }).then(sub=> {
                //send sub.toJSON()
            })
        })
}

//Perm requests
Notification.requestPermission().then((result) => {
    if (result === "granted") {
        randomNotification();
    }
});


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