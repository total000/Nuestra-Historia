import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

export function initAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.uid !== 'dJn3WVAmUYNFt25RNu3oZ3Frhwh2' && 
                user.uid !== 'bSP0tfYPHtgIjkVqZqPKDUOAgMl2') {
                window.location.href = '../index.html';
            } else {
                callback(user);
            }
        } else {
            window.location.href = '../index.html';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
}