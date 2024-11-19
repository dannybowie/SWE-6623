import { auth } from '../src/firebaseAuth.js';
import { showMessage } from '../src/uiManager.js';

const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showMessage('Logged out successfully', 'message');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showMessage('Error during sign-out', 'error');
        console.error('Sign-out error:', error);
    }
});
