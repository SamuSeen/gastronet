const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
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
    const { userId, subscription, vapidPublicKey } = request.body;

    //check if the provided VAPID key matches the expected key
    if (vapidPublicKey !== vapidDetails.publicKey) {
        return response.status(403).json({ error: "Invalid VAPID public key." });
    } else {
        console.log("Valid VAPID public key");
    }

    //store the subscription in the database with the user identifier
    db.insert({ userId, subscription }, (err, newDoc) => {
        if (err) {
        console.error("Error saving subscription:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }
        console.log("Subscription saved:", newDoc);
        response.status(200).json({ success: true });
    });
});


//todo fix up client-side
app.post('/remove-subscription', (request, response) => {
    console.log('/remove-subscription');
    console.log(request.body);
    response.status(200);
});

app.post("/notify-me", (request, response) => {
    console.log("/notify-me");
    const { userId } = request.body;
    const payload = {
        title: "Notification for Me",
        body: "This is a personalized notification.",
    };

    //find subscriptions for the specified user
    db.find({ userId }, (err, subscriptions) => {
        if (err) {
        console.error("Error fetching subscriptions:", err);
        return response.status(500).json({ error: "Internal Server Error." });
        }

        //send notifications to the user subscriptions
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
    //fetch all subscriptions from the database
    db.find({}, (err, subscriptions) => {
        if (err) {
            console.error("Error fetching subscriptions:", err);
            return;
        }
        sendNotifications(payload, subscriptions);
        response.sendStatus(200);
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

