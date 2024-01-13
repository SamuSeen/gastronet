const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
require('dotenv').config();
//const vapidKeys = webpush.generateVAPIDKeys();
//console.log(vapidKeys)



/**
 * Konfiguracja NeDB
 */
let db;
db = new Datastore({ filename: '.data/db.json', autoload: true });

/**
 * Pobieranie kluczy i ustawianie z ze zmiennych środowiskowych
 */
const vapidDetails = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    GCMkey: process.env.GCM_KEY,
    subject: process.env.VAPID_SUBJECT
};
webpush.setGCMAPIKey(vapidDetails.GCMkey);
webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
);

/**
 * Wysyła payload do wszystkich podanych subscriptions
 * @param {*} payload powiadomienie, przetwarza title,body,icon,badge,image,vibrate,data,actions
 * @param {*} subscriptions pobrać z db
 */
function sendNotifications(payload, subscriptions) {
    subscriptions.forEach((subscriptionDoc) => {
        const pushSubscription = subscriptionDoc.subscription;
        //check for subscription
        if (!pushSubscription) {
            console.error("Subscription object is undefined or missing.");
            return;
        }
        //console.debug("payload:\ntitle:"+payload.title+"\nbody:"+payload.body)
        webpush
            .sendNotification(pushSubscription, JSON.stringify(payload))
            .then(() => console.log("Notification sent successfully"))
            .catch((err) => console.error("Error sending notification:", err));
    });
}

/**
 * Regularnie wysyłane przykładowe powiadomienie
 */
function scheduleNotifications() {
    setInterval(() => {
        const payload = {
            title: "Scheduled Notification",
            body: "This is a scheduled notification.",
        };

        //pobierz subskrypcje
        db.find({}, (err, subscriptions) => {
            if (err) {
                console.error("Error fetching subscriptions:", err);
                return;
            }
            sendNotifications(payload, subscriptions);
            //response.sendStatus(200);
        });
    }, 60 * 10 * 1000); // 1000 milisekundy = 1sec
}


//Sekcja obsługi wiadomości z klienta
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

/**
 * Dodaje subskcrypcję
 * @param {*} request uid;subscription
 */
app.post("/add-subscription", (request, response) => {
    const { uid, subscription, vapidPublicKey } = request.body;

    //check if the provided VAPID key matches the expected key
    if (vapidPublicKey !== vapidDetails.publicKey) {
        return response.status(403).json({ error: "Invalid VAPID public key." });
    } else {
        console.log("Valid VAPID public key");
    }

    //store the subscription in the database with the user identifier
    db.insert({ uid, subscription }, (err, newDoc) => {
        if (err) {
        console.error("Error saving subscription:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }
        //console.log("Subscription saved:", newDoc);
        console.log("Subscription saved: ", uid);
        response.status(201).json({ success: true });
    });
});



/**
 * Usuwa subskcrypcję
 * @param {*} request endpoint
 */
app.post('/remove-subscription', (request, response) => {
    const { endpoint } = request.body;
    const query = { endpoint: endpoint };
    db.remove(query, {}, function (err, numRemoved) {
        if (err) {
            console.error("Error removing subscription:", err);
            return response.status(500).json({ error: "Internal Server Error." });
        }

        if (numRemoved > 0) {
            return response.status(200).json({ success: true });
        } else {
            return response.status(400).json({ error: "Subscription not found" });
        }
    });
});

/**
 * Wysyła przykładowe powiadomienie do jednego użytkownika
 * @param {*} request uid
 */
app.post("/notify-me", (request, response) => {
    console.log("/notify-me");
    const { uid } = request.body;
    const payload = {
        title: "Notification for Me",
        body: "This is a personalized notification.",
    };

    // Find subscriptions for the specified user
    db.find({ uid }, (err, subscriptions) => {
        if (err) {
        console.error("Error fetching subscriptions:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }

        // Send notifications to the user subscriptions
        sendNotifications(payload, subscriptions);
        response.sendStatus(200);
    });
});



/**
 * Wysyła przykładowe powiadomienie do wszystkich użytkowników
 */
app.post("/notify-all", (request, response) => {
    console.log("/notify-all");
    const payload = {
        title: "Global Notification",
        body: "This is a notification for everyone.",
    };

    //fetch all subscriptioons
    db.find({}, (err, subscriptions) => {
        if (err) {
            console.error("Error fetching subscriptions:", err);
            return;
        }
        sendNotifications(payload, subscriptions);
        //response.sendStatus(200);
    });
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
});

//listener
const listener = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${listener.address().port}`);
    scheduleNotifications();
});

/*const port = process.env.PORT || 3031;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});*/

