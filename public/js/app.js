function showAllProducts() {
    showProducts('all');
}
document.addEventListener('DOMContentLoaded', function () {
    showAllProducts();
});

// Menu
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

// Dodaj tę funkcję do obsługi dodawania produktów do koszyka
function addToCart(name, description, price, image) {
    // Pobierz aktualny stan koszyka z localStorage
    const cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];

    // Dodaj nowy produkt do koszyka
    cartProducts.push({ name, description, price, image });

    // Zapisz zaktualizowany koszyk z powrotem do localStorage
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

    // Opcjonalnie możesz dodać powiadomienie o dodaniu do koszyka, jeśli chcesz
    alert('Product added to cart!');
}

function showCartProducts() {
    const cartProductsContainer = document.getElementById('cart-products');
    let cartProductsHTML = '';

    // Pobierz informacje o produktach w koszyku z localStorage
    const cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];

    for (let i = 0; i < cartProducts.length; i++) {
        const name = cartProducts[i].name;
        const description = cartProducts[i].description;
        const price = cartProducts[i].price;
        const image = cartProducts[i].image;

        cartProductsHTML += `
            <div class="product">
                <img src="images/${image}" alt="${name}">
                <div>
                    <h3>${name}</h3>
                    <p>Description: ${description}</p>
                    <p>Price: ${price} PLN</p>
                </div>
            </div>
        `;
    }

    cartProductsContainer.innerHTML = cartProductsHTML;
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
                        <button onclick="addToCart('${name}', '${description}', '${price}', '${image}')">Add to cart</button>
                    </div>
                </div>
            `;
        }
    }

    productsContainer.innerHTML = productsHTML;
}