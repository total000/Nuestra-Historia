import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (user.uid !== 'dJn3WVAmUYNFt25RNu3oZ3Frhwh2' && 
            user.uid !== 'bSP0tfYPHtgIjkVqZqPKDUOAgMl2') {
            window.location.href = '../index.html';
        }
    } else {
        window.location.href = '../index.html';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

const diaryForm = document.getElementById('diaryForm');
const entriesContainer = document.getElementById('entriesContainer');

diaryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('entryTitle').value;
    const content = document.getElementById('entryContent').value;
    
    if (currentUser) {
        try {
            await addDoc(collection(db, 'diary'), {
                title,
                content,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                timestamp: serverTimestamp()
            });
            diaryForm.reset();
        } catch (error) {
            console.error('Error al guardar the entry:', error);
        }
    }
});

const q = query(collection(db, 'diary'), orderBy('timestamp', 'desc'));
onSnapshot(q, (snapshot) => {
    entriesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const entryEl = document.createElement('div');
        entryEl.className = 'entry-card';
        entryEl.innerHTML = `
            <h3 class="entry-title">${data.title}</h3>
            <p class="entry-content">${data.content}</p>
            <p class="entry-author">Por ${data.userEmail.split('@')[0]}</p>
            <p class="entry-date">${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Ahora'}</p>
        `;
        entriesContainer.appendChild(entryEl);
    });
});