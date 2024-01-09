const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
require('dotenv').config();
//const vapidKeys = webpush.generateVAPIDKeys();
//console.log(vapidKeys)



//setting up NeDB with synchronous initialization
let db;
db = new Datastore({ filename: '.data/db.json', autoload: true });

//setting up web-push keys
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


function sendNotifications(payload, subscriptions) {
    subscriptions.forEach((subscriptionDoc) => {
        const pushSubscription = subscriptionDoc.subscription;
        //check for subscription
        if (!pushSubscription) {
            console.error("Subscription object is undefined or missing.");
            return;
        }
        console.debug("payload:\ntitle:"+payload.title+"\nbody:"+payload.body)
        webpush
            .sendNotification(pushSubscription, JSON.stringify(payload))
            .then(() => console.log("Notification sent successfully"))
            .catch((err) => console.error("Error sending notification:", err));
    });
}

//notification scheduler
function scheduleNotifications() {
    setInterval(() => {
        const payload = {
            title: "Scheduled Notification",
            body: "This is a scheduled notification.",
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
    }, 60 * 10000); // 1000 milisekundy = 1sec
}

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

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


//todo fix up client-side
//wait, what actually does this do?
app.post('/remove-subscription', (request, response) => {
    //console.log('/remove-subscription');
    //console.log(request.body);
    const { subscription } = request.body
    db.remove({subscription},{},function (err, numRemoved) {
        if (err) {
            console.error("Error fetching subscriptions:", err);
            return response.status(500).json({ error: "Internal Server Error." });
        }
        if (numRemoved>0) {
            return response.status(200);
        }
    });
    return response.status(400);
});

app.post("/notify-me", (request, response) => {
    console.log("/notify-me");
    //console.debug(request)
    const { uid } = request.body;
    const payload = {
        title: "Notification for Me",
        body: "This is a personalized notification.",
    };

    //find subscriptions for the specified user
    db.find({ uid }, (err, subscriptions) => {
        //console.debug("Looking for user: "+uid)
        if (err) {
            console.error("Error fetching subscriptions:", err);
            return response.status(500).json({ error: "Internal Server Error." });
        }

        //send notifications to the user subscriptions
        //console.debug("Found: "+subscriptions)
        sendNotifications(payload, subscriptions);
        response.sendStatus(200);
    });
});

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

