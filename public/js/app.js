document.addEventListener('DOMContentLoaded', function () //event listener na załadowanie strony
{
    showProducts('all'); //wywołanie funkcji showProducts która jest niżej
});


function loadXMLDoc(filename) {
    if (navigator.onLine) {
        // Użytkownik jest online, próbujemy załadować dane z serwera
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.open("GET", filename, false);
        try {
            xhttp.responseType = "msxml-document";
        } catch (err) { }
        xhttp.send("");
        if (xhttp.status === 200) {
            // Zapisz dane w schowku
            localStorage.setItem('cachedXML', new XMLSerializer().serializeToString(xhttp.responseXML));
            return xhttp.responseXML;
        } else {
            console.error('Failed to load XML from the server');
            return null; // lub inny sposób obsługi błędu ładowania z serwera
        }
    } else {
        // Użytkownik jest offline, próbujemy załadować dane z lokalnego schowka
        const cachedData = localStorage.getItem('cachedXML');
        if (cachedData) {
            const parser = new DOMParser();
            return parser.parseFromString(cachedData, 'application/xml');
        } else {
            console.error('No cached data available');
            return null; // lub inny sposób obsługi braku danych
        }
    }
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

function showProducts(category) { //funkcja od wyświetlania listy produktów w kontenerze na stronie po filtrze produktów
    const productsContainer = document.getElementById('products'); //utworzenie zmiennej kontenera z początku wyświetlający wszystkie elementy products
    let productsHTML = ''; //użyto let a nie const bo z każdą iteracją pętli for zmieniamy (uzupełniamy) zmienną productsHTML

    const xmlDoc = loadXMLDoc("product.xml"); // ładowanie xmla z listą produktów

    const products = xmlDoc.getElementsByTagName('product'); //pobranie wszystkich elementów z pliku xml po tagu <product> - pomysł na listę produktów z xml zaczerpnąłem z pracy, ale tamtejsze xmle wyglądają inaczej i są dużo bardziej złożone

    for (let i = 0; i < products.length; i++) { //dla każdego elementu (produktu) w pliku xml wykonujemy krok pętli for
        const categoryType = products[i].parentNode.getAttribute('name'); //pobranie nazwy kategorii produktu (kolejny zakorzeniony element)
        if (categoryType === category || category === 'all') { //jeżeli categoryType dla elementu z product.xml jest równy temu który został podany w parametrze dla wywołania funkcji lub jest równy kategorii 'all' to po prostu buduje się productsHTML 
            const name = products[i].getElementsByTagName('name')[0].childNodes[0].nodeValue; //pobranie nazwy do HTML
            const description = products[i].getElementsByTagName('description')[0].childNodes[0].nodeValue; //pobranie opisu do HTML
            const price = products[i].getElementsByTagName('price')[0].childNodes[0].nodeValue; //pobranie ceny do HTML
            const image = products[i].getElementsByTagName('image')[0].childNodes[0].nodeValue; //pobranie obrazka do HTML


            //jeżeli warunki przed ifem zostaną spełnione, to właśnie o taki "moduł" productsHTML zostaje rozbudowywany, jak najzwyklejsza strona
            //jest tam też przycisk Add to cart wowołujący funkcję addToCart z parametrami opisanymi przy samej funkcji na górze
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

    productsContainer.innerHTML = productsHTML; //a tu zmiana wartości zmiennej na zawartość productsHTML utworzonego po filtrze
}