import { auth } from '/src/firebaseAuth.js';
import { showMessage } from '/src/uiManager.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const logout_submit = document.getElementById('logout_submit');

logout_submit.addEventListener('click', (event) => {
    event.preventDefault();

    auth.signOut()
    .then(() => {
        showMessage('Logout successful!', 'signInMessage');
        // Redirect to index.html
        setTimeout(()=>{
            window.location.href = 'index.html';
        }, 1500);
        console.log('Signed Out');
    })
    .catch(e=>{
        showMessage('Error with logout.', 'signInMessage');
        console.error('Sign Out Error', e);
    });
});