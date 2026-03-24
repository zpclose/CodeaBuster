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
const isDev = process.env.NODE_ENV === 'development';

export async function uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    const storage = getStorageInstance();

    if (!storage) {
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
    const storageRef = ref(storage, fullPath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (isDev) {
                    console.log('📊 Upload progress:', Math.round(progress) + '%');
                }
                if (onProgress) {
                    onProgress({
                        bytesTransferred: snapshot.bytesTransferred,
                        totalBytes: snapshot.totalBytes,
                        progress,
                    });
                }
            },
            (error) => {
                if (isDev) {
                    console.error('Upload error:', error.code);
                }
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    // Verify the URL is accessible before resolving
                    const img = new Image();
                    img.onload = () => {
                        resolve(downloadURL);
                    };
                    img.onerror = () => {
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
    } catch (error) {
        // Check if it's a "not found" error and handle gracefully
        if (error instanceof Error && error.message.includes('object-not-found')) {
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
