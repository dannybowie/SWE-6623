// src/eventHandler.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function saveEventToFirebase(eventData) {
    const docRef = db.collection('events').doc();
    return docRef.set({
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        attendees: eventData.attendees,
        organizer: eventData.organizer,
        status: eventData.status
    })
    .then(() => {
        console.log("Event saved successfully");
        uploadEventImage(eventData.image);
    })
    .catch((error) => {
        console.error("Error saving event:", error);
    });
}

function uploadEventImage(imageFile) {
    const storageRef = firebase.storage().ref(`events/${imageFile.name}`);
    const snapshot = storageRef.put(imageFile);

    snapshot.on('state_changed', function(progressSnapshot) {
        var percentage = (progressSnapshot.bytesTransferred / progressSnapshot.totalBytes) * 100;
        console.log(percentage + "% complete");
    }, function(error) {
        console.error("Error uploading image:", error);
    }, function() {
        storageRef.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            updateEventDocumentWithImageUrl(db.doc('events/' + imageData.id), downloadURL);
        }).catch(function(error) {
            console.error("Error getting download URL:", error);
        });
    });
}

function updateEventDocumentWithImageUrl(docRef, imageUrl) {
    return docRef.update({
        imageUrl: imageUrl
    }).then(() => {
        console.log("Event document updated with image URL");
    }).catch((error) => {
        console.error("Error updating event document:", error);
    });
}

function deleteEvent(eventId) {
    return db.collection('events').doc(eventId).delete()
    .then(() => {
        console.log("Event deleted successfully");
    })
    .catch((error) => {
        console.error("Error deleting event:", error);
    });
}

function getEvents() {
    return db.collection('events').get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
        });
    })
    .catch((error) => {
        console.error("Error fetching events:", error);
    });
}