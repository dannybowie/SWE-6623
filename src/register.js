
import { auth, db } from '../src/firebaseAuth.js';
import { showMessage } from '../src/uiManager.js';

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
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

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Generate a unique ID for the user
            const userId = user.uid; // Use Firebase's built-in UID instead of generating a new one
            
            // Create an object to store additional user information
            // This data will be saved to Firestore for a more complete user profile
            const userData = {
                id: userId,
                email: email,
                firstName: nameFirst,
                lastName: nameLast,
                department: department,
                PTO: 40
            };

            showMessage('User account created successfully. Saving details...', 'signUpMessage');
            
            const docRef = doc(db, "users", userId);
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
