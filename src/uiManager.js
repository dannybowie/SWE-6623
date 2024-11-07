// The UI manager is intended to manage the functions of UI pop ups, styles based on user-specific data, etc.

import { auth, db } from '/SWE-6623/src/firebaseAuth.js';
import { doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// This function displays the pop-up message above the login / signup forms
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "flex";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
    }, 4000);
}

function setWelcomeMessage(user){
    const docRef = doc(db, "users", user.uid);
    const name = user.firstName;

    const welcomeElement = document.getElementById('homePage_welcome');
    if(welcomeElement && user){
        welcomeElement.textContent = `Welcome, ${name}!`
    }

}

export{showMessage, setWelcomeMessage };