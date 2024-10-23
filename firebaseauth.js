// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId){
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display="flex"; // display the speech bubble
    messageDiv.innerHTML = message; // set the contents of the bubble
    messageDiv.style.opacity = 1;
    // after 5 seconds set the opacity to 0
    setTimeout(function(){
        messageDiv.style.opacity = 0;
    }, 5000)
}

const register_submit = document.getElementById('reg_submit');

// this runs when the eventlistener of "click" occurs on the registration submit button
register_submit.addEventListener('click', (event)=>{

    event.preventDefault(); // Prevent form submission to handle registration with custom logic below

    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    const nameFirst = document.getElementById('reg_nameFirst').value;
    const nameLast = document.getElementById('reg_nameLast').value;

    const auth = getAuth(); // initializes and returns a Firebase Authentication instance, enabling you to perform authentication operations like user registration and sign-in for your app.
    const db = getFirestore(); // initializes and returns a Firestore database instance, allowing you to interact with your Firebase cloud database for operations like reading, writing, and querying data.

    createUserWithEmailAndPassword(auth, email, password)

    // This next bit handles the asynchronous result of user registration.
    // Allows us to access the new user object and perform follow-up actions such as storing additional user data in Firestore
    .then((userCredential)=>{
        const user = userCredential.user // Get the newly created user object from Firebase Authentication
        
        // Create an object to store additional user information
        // This object will be saved to Firestore, associating extra data with the user's account
        // We're including email, firstName, and lastName
        const userData = {
            email: email,
            firstName: nameFirst,
            listName: nameLast,
        };
        showMessage('User account created successfully', 'signUpMessage');
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
        .then(()=>{
            window.location.href='index.html';
        })
        .catch((error)=>{
            showMessage(`Error writing document: ${error}`, 'signUpMessage');
        })
    })
    .catch((error)=>{
        const errorCode = error.code;
        if(errorCode == 'auth/email-already-in-use'){
            showMessage('Email address is already in use', 'signUpMessage');
        }
        else{
            showMessage(`Unable to create new user: ${errorCode}`, 'signUpMessage');
        }
    })
})