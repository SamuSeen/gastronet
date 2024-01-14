document.addEventListener('DOMContentLoaded', function () //event listener na załadowanie strony
{
    showProducts('all'); //wywołanie funkcji showProducts która jest niżej
});


function loadXMLDoc(filename, callback) {
    const xhttp = new XMLHttpRequest();

    xhttp.open("GET", filename, true);

    xhttp.onload = function () {
        if (xhttp.status === 200) {
            // Sukces - przekazujemy dane do callbacka
            callback(xhttp.responseXML);
        } else {
            // Obsłuż błąd, możesz też przekazać informację o błędzie do callbacka
            console.error("Błąd ładowania XML:", xhttp.statusText);
            callback(null);
        }
    };

    xhttp.send();
}

function addToCart(name, description, price, image) { //funkcja dodawania produktów do koszyka wywoływana z 4 parametrami co widać

    const cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || []; //zmienna do której pobieramy aktualny stan koszyka

    cartProducts.push({ name, description, price, image }); //dodanie elementu dla którego wykonujemy funkcję

    localStorage.setItem('cartProducts', JSON.stringify(cartProducts)); //zapisanie koszyka z nowym elementem

    // powiadomienie o dodaniu do koszyka, ale denerwowało, więc pozostaje do rozważenia
    //alert('Product added to cart!');
}

function showCartProducts() { //funkcja od pokazywania listy produktów z koszyka w kontenerze na stronie cart.html
    const cartProductsContainer = document.getElementById('cart-products'); //utworzenie kontenera o zawartości koszyka
    let cartProductsHTML = ''; //z początku tworzymy pusty html dla elementów koszyka

    const cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || []; //pobranie do zmiennej cartProducts elementów z localStorage (dodawane są do niego przez funkcję addToCart)

    for (let i = 0; i < cartProducts.length; i++) { //dla każdego elementu cartProducts wywołujemy pętlę
        const name = cartProducts[i].name; //do zmiennej name przpisujemy name
        const description = cartProducts[i].description; //itd
        const price = cartProducts[i].price; //itp
        const image = cartProducts[i].image;
        
        //potem o ten moduł rozbudowujemy HTMLa:
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

    cartProductsContainer.innerHTML = cartProductsHTML; //przypisujemy kontenerowi zawartość naszego HTMLa
}

function showProducts(category) {
    const productsContainer = document.getElementById('products');

    loadXMLDoc("product.xml", function (xmlDoc) {
        if (xmlDoc) {
            const products = xmlDoc.getElementsByTagName('product');

            let productsHTML = '';

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
        } else {
            // Obsłuż błąd ładowania XML
            console.error("Błąd ładowania XML");
        }
    });
}