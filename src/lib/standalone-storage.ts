// Storage tanpa auth untuk testing
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storageConfig = {
  "apiKey": "AIzaSyBskvSVKzYCxcQwYRedDp6mEwpNjGftXfc",
  "authDomain": "studio-8681629558-68f05.firebaseapp.com",
  "projectId": "studio-8681629558-68f05",
  "storageBucket": "studio-8681629558-68f05.firebasestorage.app",
  "messagingSenderId": "558334217993",
  "appId": "1:558334217993:web:559929cd726ce9bf1fcdd8"
};

let storageApp;
if (!getApps().some(app => app.name === 'storage-only')) {
  storageApp = initializeApp(storageConfig, 'storage-only');
} else {
  storageApp = getApp('storage-only');
}

export const standaloneStorage = getStorage(storageApp);

export async function uploadToStandaloneStorage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(standaloneStorage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Standalone storage upload error:', error);
    throw error;
  }
}