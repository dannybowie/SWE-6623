import { auth, db } from '/SWE-6623/src/firebaseAuth.js';
import { showMessage } from '/SWE-6623/src/uiManager.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Import setDoc and doc functions from Firebase Firestore
// setDoc: Used to write user data to Firestore after successful account creation
// doc: Used to create a reference to the user's document in Firestore
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const register_submit = document.getElementById('reg_submit');

// when register is clicked
register_submit.addEventListener('click', (event) => {
    event.preventDefault();

    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    const nameFirst = document.getElementById('reg_nameFirst').value;
    const nameLast = document.getElementById('reg_nameLast').value;
    const department = document.getElementById('reg_department').value;

    createUserWithEmailAndPassword(auth, email, password) // Attempt to create a new user account with the provided email and password
        .then((userCredential) => {  // If successful, this callback receives a UserCredential object
            const user = userCredential.user; // The 'user' object contains information about the newly created user
            
            // Create an object to store additional user information
            // This data will be saved to Firestore for a more complete user profile
            const userData = {
                email: email,
                firstName: nameFirst,
                lastName: nameLast,
                department: department
            };
            
            showMessage('User account created successfully. Redirecting...', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    setTimeout(() => {
                        window.location.href = 'index.html';    
                    }, 2000);
                })
                .catch((error) => {
                    showMessage(`Error writing document: ${error}`, 'signUpMessage');
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email address is already in use', 'signUpMessage');
            } else {
                showMessage(`Unable to create new user: <br><br>${errorCode}`, 'signUpMessage');
            }
        });
});