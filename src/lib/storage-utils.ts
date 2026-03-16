import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    getStorage,
    UploadTaskSnapshot,
} from 'firebase/storage';
import { getStorageApp } from '@/firebase';

// Get storage instance from the dedicated storage Firebase project
function getStorageInstance() {
    const app = getStorageApp();
    return app ? getStorage(app) : null;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number; // 0-100
}

/**
 * Upload an image to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., 'team-members/member-123/profile.jpg')
 * @param onProgress - Optional callback for upload progress
 * @returns Download URL of uploaded image
 */
export async function uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    const storage = getStorageInstance();
    console.log('  Starting upload:', { file: file.name, path, storage: !!storage });

    if (!storage) {
        console.error('❌ Firebase Storage not initialized');
        throw new Error('Firebase Storage not initialized');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
    }

    const fullPath = `images/${path}`;
    console.log('📁 Storage path:', fullPath);
    console.log('🔍 Storage instance:', storage);

    const storageRef = ref(storage, fullPath);
    console.log('✅ Storage ref created:', storageRef);

    const uploadTask = uploadBytesResumable(storageRef, file);
    console.log('📤 Upload task created:', { fullPath, fileSize: file.size });

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('📊 Upload progress:', {
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    progress: Math.round(progress),
                    state: snapshot.state
                });
                if (onProgress) {
                    onProgress({
                        bytesTransferred: snapshot.bytesTransferred,
                        totalBytes: snapshot.totalBytes,
                        progress,
                    });
                }
            },
            (error) => {
                console.error('❌ Upload error:', error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    serverResponse: error.serverResponse
                });
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    // Verify the URL is accessible before resolving
                    const img = new Image();
                    img.onload = () => {
                        console.log('✅ Image URL verified and accessible');
                        resolve(downloadURL);
                    };
                    img.onerror = () => {
                        console.warn('⚠️ Image URL not immediately accessible, but upload was successful');
                        resolve(downloadURL); // Still resolve since upload was successful
                    };
                    img.src = downloadURL;
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Delete an image from Firebase Storage
 * @param url - Download URL or storage path of the image
 */
export async function deleteImage(url: string): Promise<void> {
    const storage = getStorageInstance();
    if (!storage) {
        throw new Error('Firebase Storage not initialized');
    }

    try {
        // Extract path from URL if it's a download URL
        let path = url;
        if (url.includes('firebasestorage.googleapis.com')) {
            const urlParts = url.split('/o/');
            if (urlParts.length > 1) {
                path = decodeURIComponent(urlParts[1].split('?')[0]);
            }
        }

        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log('✅ Image deleted successfully:', path);
    } catch (error) {
        console.error('Delete error:', error);
        // Check if it's a "not found" error and handle gracefully
        if (error instanceof Error && error.message.includes('object-not-found')) {
            console.warn('⚠️ Image not found in storage, continuing...');
            return; // Don't throw for not found errors
        }
        throw error;
    }
}

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original filename
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    const sanitized = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitized}-${timestamp}.${extension}`;
}

/**
 * Get storage path for content type
 * @param contentType - Type of content
 * @param contentId - ID of the content
 * @param filename - Filename
 * @returns Storage path
 */
export function getStoragePath(
    contentType: 'team-members' | 'achievements' | 'partners' | 'pages' | 'site',
    contentId: string,
    filename: string
): string {
    return `${contentType}/${contentId}/${filename}`;
}
