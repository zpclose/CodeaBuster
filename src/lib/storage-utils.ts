export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number; // 0-100
}

const isDev = process.env.NODE_ENV === 'development';

// R2 upload via API route (client-side tidak bisa akses R2 langsung)
async function uploadToR2(file: File, path: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    // Simulate progress start
    onProgress?.({ bytesTransferred: 0, totalBytes: file.size, progress: 0 });

    const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Upload gagal');
    }

    const { url } = await res.json();

    // Simulate progress complete
    onProgress?.({ bytesTransferred: file.size, totalBytes: file.size, progress: 100 });

    if (isDev) console.log('Upload R2 berhasil:', url);
    return url;
}

/**
 * Upload file (gambar/video) ke Cloudflare R2
 * @param file - File yang akan diupload
 * @param path - Storage path (e.g., 'team-members/member-123/profile.jpg')
 * @param onProgress - Callback progress upload (opsional)
 * @returns Public URL file di R2
 */
export async function uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    // Validasi tipe file
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        throw new Error('File harus berupa gambar atau video');
    }

    // Validasi ukuran (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('Ukuran file maksimal 10MB');
    }

    const fullPath = `images/${path}`;
    return uploadToR2(file, fullPath, onProgress);
}

/**
 * Hapus file dari Cloudflare R2
 * @param url - Public URL atau storage path file
 */
export async function deleteImage(url: string): Promise<void> {
    try {
        // Ekstrak path dari R2 URL
        let path = url;

        const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
        if (r2BaseUrl && url.startsWith(r2BaseUrl)) {
            path = url.replace(r2BaseUrl + '/', '');
        } else if (url.includes('r2.dev/')) {
            path = url.split('r2.dev/')[1];
        } else if (url.includes('firebasestorage.googleapis.com')) {
            // URL lama Firebase — skip, sudah dimigrasi
            if (isDev) console.warn('Skip delete URL Firebase lama:', url);
            return;
        }

        const res = await fetch('/api/storage/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || 'Delete gagal');
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return; // File tidak ada, tidak perlu throw
        }
        throw error;
    }
}

/**
 * Generate nama file unik dengan timestamp
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    const sanitized = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitized}-${timestamp}.${extension}`;
}

/**
 * Get storage path berdasarkan tipe konten
 */
export function getStoragePath(
    contentType: 'team-members' | 'achievements' | 'partners' | 'pages' | 'site',
    contentId: string,
    filename: string
): string {
    return `${contentType}/${contentId}/${filename}`;
}
