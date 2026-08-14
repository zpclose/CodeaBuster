/**
 * Standalone storage upload — sebelumnya pakai Firebase Storage,
 * sekarang redirect ke R2 via API route yang sama.
 */

export async function uploadToStandaloneStorage(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Upload gagal');
    }

    const { url } = await res.json();
    return url;
}
