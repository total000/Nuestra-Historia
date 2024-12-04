import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

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

let currentUser = null;

// Authentication check
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

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// View toggle functionality
const gridViewBtn = document.getElementById('gridView');
const listViewBtn = document.getElementById('listView');
const memoriesContainer = document.getElementById('memoriesContainer');

gridViewBtn.addEventListener('click', () => {
    memoriesContainer.className = 'memories-grid';
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
});

listViewBtn.addEventListener('click', () => {
    memoriesContainer.className = 'memories-list';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

// File upload preview
const mediaUpload = document.getElementById('mediaUpload');
const uploadPreview = document.getElementById('uploadPreview');
const uploadProgress = document.getElementById('uploadProgress');
let selectedFiles = [];

mediaUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    selectedFiles = [...selectedFiles, ...files];
    updatePreview();
});

function updatePreview() {
    uploadPreview.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const preview = document.createElement('div');
        preview.className = 'preview-item';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            preview.appendChild(video);
        } else {
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.textContent = getFileIcon(file.name);
            preview.appendChild(icon);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            updatePreview();
        };

        preview.appendChild(removeBtn);
        uploadPreview.appendChild(preview);
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf': return '📄';
        case 'docx': return '📝';
        default: return '📎';
    }
}

// Memory form submission
const memoryForm = document.getElementById('memoryForm');

memoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('memoryTitle').value;
    const description = document.getElementById('memoryDescription').value;
    const mediaUrl = document.getElementById('mediaUrl').value;
    
    if (currentUser) {
        try {
            const uploadedFiles = await uploadFiles(selectedFiles);
            
            await addDoc(collection(db, 'memories'), {
                title,
                description,
                mediaUrl: mediaUrl || null,
                files: uploadedFiles,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                timestamp: serverTimestamp()
            });

            memoryForm.reset();
            selectedFiles = [];
            uploadPreview.innerHTML = '';
            uploadProgress.innerHTML = '';
        } catch (error) {
            console.error('Error al guardar el recuerdo:', error);
        }
    }
});

async function uploadFiles(files) {
    const uploadedFiles = [];
    
    for (const file of files) {
        const storageRef = ref(storage, `memories/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    updateProgressBar(progress);
                },
                (error) => {
                    console.error('Error al subir archivo:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    uploadedFiles.push({
                        url: downloadURL,
                        type: file.type,
                        name: file.name
                    });
                    resolve();
                }
            );
        });
    }
    
    return uploadedFiles;
}

function updateProgressBar(progress) {
    uploadProgress.innerHTML = `
        <div class="progress-bar" style="width: ${progress}%"></div>
    `;
}

// Display memories
const q = query(collection(db, 'memories'), orderBy('timestamp', 'desc'));
onSnapshot(q, (snapshot) => {
    memoriesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const memoryEl = document.createElement('div');
        memoryEl.className = 'memory-card';
        
        let mediaContent = '';
        if (data.mediaUrl) {
            if (isVideoURL(data.mediaUrl)) {
                mediaContent = `<video src="${data.mediaUrl}" controls class="memory-media"></video>`;
            } else {
                mediaContent = `<img src="${data.mediaUrl}" alt="${data.title}" class="memory-media">`;
            }
        }
        
        let filesContent = '';
        if (data.files && data.files.length > 0) {
            filesContent = '<div class="memory-files">' +
                data.files.map(file => `
                    <a href="${file.url}" target="_blank" class="file-badge">
                        ${getFileIcon(file.name)} ${file.name}
                    </a>
                `).join('') +
            '</div>';
        }
        
        memoryEl.innerHTML = `
            ${mediaContent}
            <div class="memory-content">
                <h3 class="memory-title">${data.title}</h3>
                <p class="memory-description">${data.description}</p>
                ${filesContent}
                <div class="memory-date">
                    <span>${data.userEmail.split('@')[0]}</span>
                    <span>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Ahora'}</span>
                </div>
            </div>
        `;
        
        memoryEl.addEventListener('click', () => {
            showModal(data);
        });
        
        memoriesContainer.appendChild(memoryEl);
    });
});

function isVideoURL(url) {
    return url.match(/\.(mp4|webm|ogg)$/i);
}

// Modal functionality
const modal = document.getElementById('mediaModal');
const modalClose = document.querySelector('.modal-close');

function showModal(data) {
    const modalMedia = document.getElementById('modalMedia');
    const modalInfo = document.getElementById('modalInfo');
    
    if (data.mediaUrl) {
        if (isVideoURL(data.mediaUrl)) {
            modalMedia.innerHTML = `<video src="${data.mediaUrl}" controls></video>`;
        } else {
            modalMedia.innerHTML = `<img src="${data.mediaUrl}" alt="${data.title}">`;
        }
    } else {
        modalMedia.innerHTML = '';
    }
    
    modalInfo.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        ${data.files ? `
            <div class="memory-files">
                ${data.files.map(file => `
                    <a href="${file.url}" target="_blank" class="file-badge">
                        ${getFileIcon(file.name)} ${file.name}
                    </a>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});