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
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

let db; // Declare db outside so it can be accessed globally

// Use lowdb with synchronous require
const adapter = new FileSync('.data/db.json');
db = low(adapter);

// Now you can use the 'db' object and other variables

// Initialize or perform operations on the db inside this block
db.defaults({
    subscriptions: []
}).write();

// Additional code that relies on the 'db' object

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


app.post('/add-subscription', (request, response) => {
    const { subscription, vapidPublicKey } = req.body;

    // Check if the provided VAPID key matches the expected key
    if (vapidPublicKey !== "BHKnEUIn2lpOowyM4DG9qv96Cxz-jaNHxmpxTw4XowvXxU4Wzl4ThSDCyljYeRyyVBWfJmRByMR5UY2UeuPBRV0") {
        return res.status(403).json({ error: 'Invalid VAPID public key.' });
    } else {
        console.log("Valid VAPID public key")
    }

    // Handle the subscription
    console.log('/add-subscription');
    console.log(request.body);
    response.sendStatus(200).json({ success: true });
});

app.post('/remove-subscription', (request, response) => {
    console.log('/remove-subscription');
    console.log(request.body);
    response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
    console.log('/notify-me');
    console.log(request.body);
    response.sendStatus(200);
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