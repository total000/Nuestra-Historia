import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyCyBRfQDFXjusN_aalebWPPIgsm5QWr9fg",
    authDomain: "oscar-afc2f.firebaseapp.com",
    databaseURL: "https://oscar-afc2f-default-rtdb.firebaseio.com",
    projectId: "oscar-afc2f",
    storageBucket: "oscar-afc2f.firebasestorage.app",
    messagingSenderId: "205663051008",
    appId: "1:205663051008:web:b7cfb775523d92895467e5",
    measurementId: "G-EQL8BZNDHX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (user.uid === 'dJn3WVAmUYNFt25RNu3oZ3Frhwh2' || 
            user.uid === 'bSP0tfYPHtgIjkVqZqPKDUOAgMl2') {
            window.location.href = 'pages/home.html';
        } else {
            errorMessage.textContent = 'Usuario no autorizado';
        }
    } catch (error) {
        errorMessage.textContent = 'Correo o contraseña incorrectos';
    }
});