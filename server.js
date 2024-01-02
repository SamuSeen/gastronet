//VAPID keys
/*=======================================

Public Key:
BHKnEUIn2lpOowyM4DG9qv96Cxz-jaNHxmpxTw4XowvXxU4Wzl4ThSDCyljYeRyyVBWfJmRByMR5UY2UeuPBRV0

Private Key:
bhUUDJuXqGkT7ZNcFJJGi30BhIFyvI-326FW7sVV-QI

=======================================*/
const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
// Use dynamic import to import the lowdb library
let lowdb; // Declare lowdb outside so it can be accessed globally
let FileSync; // Declare FileSync outside so it can be accessed globally

import('lowdb').then((module) => {
    lowdb = module.default;
    FileSync = lowdb.adapters.FileSync;

    const adapter = new FileSync('.data/db.json');
    const db = lowdb(adapter);

    // Now you can use the 'db' object and other variables

    // Initialize or perform operations on the db inside this block
    db.defaults({
        subscriptions: []
    }).write();

    // Additional code that relies on the 'db' object
});

const vapidDetails = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT
};

function sendNotifications(subscriptions) {
    // TODO
}

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post("/add-subscription", (request, response) => {
    const { uid, subscription, vapidPublicKey } = request.body;

    // Check if the provided VAPID key matches the expected key
    if (vapidPublicKey !== "BHKnEUIn2lpOowyM4DG9qv96Cxz-jaNHxmpxTw4XowvXxU4Wzl4ThSDCyljYeRyyVBWfJmRByMR5UY2UeuPBRV0") {
        return res.status(403).json({ error: 'Invalid VAPID public key.' });
    } else {
        console.log("Valid VAPID public key")
    }

    //store the subscription in the database with the user identifier
    db.insert({ uid, subscription }, (err, newDoc) => {
        if (err) {
        console.error("Error saving subscription:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }
        console.log("Subscription saved:", newDoc);
        response.status(200).json({ success: true });
    });
});


//todo fix up client-side
//wait, what actually does this do?
app.post('/remove-subscription', (request, response) => {
    console.log('/remove-subscription');
    console.log(request.body);
    response.sendStatus(200);
});

app.post("/notify-me", (request, response) => {
    console.log("/notify-me");
    const { uid } = request.body;
    const payload = {
        title: "Notification for Me",
        body: "This is a personalized notification.",
    };

    //find subscriptions for the specified user
    db.find({ uid }, (err, subscriptions) => {
        if (err) {
        console.error("Error fetching subscriptions:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }

        //send notifications to the user subscriptions
        sendNotifications(payload, subscriptions);
        response.sendStatus(200);
    });
});

app.post('/notify-all', (request, response) => {
    console.log('/notify-all');
    response.sendStatus(200);
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${listener.address().port}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});