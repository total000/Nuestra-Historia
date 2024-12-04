import { initAuth } from './utils/auth.js';
import { db } from './utils/firebase.js';
import { uploadMedia, isMediaUrl, isImageUrl, isVideoUrl } from './utils/media.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;

// Initialize authentication
initAuth(user => {
    currentUser = user;
});

// Mobile menu functionality
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
});

// Message form handling
const messageForm = document.getElementById('messageForm');
const mediaUpload = document.getElementById('mediaUpload');
const uploadPreview = document.getElementById('uploadPreview');
let selectedFiles = [];

mediaUpload?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    selectedFiles = [...selectedFiles, ...files];
    updatePreview();
});

function updatePreview() {
    if (!uploadPreview) return;
    
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

messageForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const mediaUrl = document.getElementById('mediaUrl')?.value;
    const message = messageInput?.value.trim();
    
    if (currentUser && (message || selectedFiles.length > 0 || mediaUrl)) {
        try {
            const uploadedFiles = await Promise.all(
                selectedFiles.map(file => uploadMedia(file, 'messages'))
            );

            await addDoc(collection(db, 'messages'), {
                text: message || '',
                mediaUrl: mediaUrl || null,
                files: uploadedFiles,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                timestamp: serverTimestamp()
            });

            if (messageInput) messageInput.value = '';
            if (mediaUrl) document.getElementById('mediaUrl').value = '';
            selectedFiles = [];
            if (uploadPreview) uploadPreview.innerHTML = '';
            const uploadProgress = document.getElementById('uploadProgress');
            if (uploadProgress) uploadProgress.innerHTML = '';
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    }
});

// Display messages
const messagesDiv = document.getElementById('messages');
const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

onSnapshot(q, (snapshot) => {
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const messageEl = document.createElement('div');
        messageEl.className = 'message';

        let mediaContent = '';
        
        // Handle direct media URL
        if (data.mediaUrl && isMediaUrl(data.mediaUrl)) {
            if (isImageUrl(data.mediaUrl)) {
                mediaContent += `<img src="${data.mediaUrl}" alt="Imagen compartida" class="message-media">`;
            } else if (isVideoUrl(data.mediaUrl)) {
                mediaContent += `<video src="${data.mediaUrl}" controls class="message-media"></video>`;
            }
        }

        // Handle uploaded files
        if (data.files && data.files.length > 0) {
            data.files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    mediaContent += `<img src="${file.url}" alt="${file.name}" class="message-media">`;
                } else if (file.type.startsWith('video/')) {
                    mediaContent += `<video src="${file.url}" controls class="message-media"></video>`;
                }
            });
        }

        messageEl.innerHTML = `
            <div class="message-header">
                <span>${data.userEmail.split('@')[0]}</span>
                <span>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Ahora'}</span>
            </div>
            ${mediaContent}
            <div class="message-content">${data.text}</div>
        `;

        messagesDiv.appendChild(messageEl);
    });
});