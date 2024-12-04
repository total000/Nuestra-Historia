import { storage } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

export function isMediaUrl(url) {
    return /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(url);
}

export function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
}

export function isVideoUrl(url) {
    return /\.(mp4|webm|ogg)$/i.test(url);
}

export async function uploadMedia(file, path) {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const progressBar = document.getElementById('uploadProgress');
                if (progressBar) {
                    progressBar.innerHTML = `<div class="progress-bar" style="width: ${progress}%"></div>`;
                }
            },
            (error) => reject(error),
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        url: downloadURL,
                        type: file.type,
                        name: file.name
                    });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}