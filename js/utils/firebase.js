import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

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
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };