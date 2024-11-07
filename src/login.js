import { auth } from '/SWE-6623/src/firebaseAuth.js';
import { showMessage } from '/SWE-6623/src/uiManager.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Wait for DOMContentLoaded before executing our code
document.addEventListener('DOMContentLoaded', function() {
  const login_submit = document.getElementById('login_submit');

  // Check if the element exists
  if (login_submit) {
    login_submit.addEventListener('click', (event) => {
      event.preventDefault();

      const email = document.getElementById('login_email').value;
      const password = document.getElementById('login_password').value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          showMessage('Login Successful!', 'signInMessage');
          const user = userCredential.user;
          setTimeout(() => {
            window.location.href = 'calendar.html';
          }, 1500);
        })
        .catch((error) => {
          const errorCode = error.code;
          if (errorCode == 'auth/invalid-email') {
            showMessage(`Invalid username or password. Please try again. <br><br>${errorCode}`, 'signInMessage');
          } else {
            showMessage(`Login error: <br><br>${errorCode}`, 'signInMessage');
          }
        });
    });
  } else {
    console.error("Element with id 'login_submit' not found");
  }
});
