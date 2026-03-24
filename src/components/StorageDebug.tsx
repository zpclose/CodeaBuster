'use client';

// Debug component - only available in development
import { getStorageApp } from '@/firebase';
import { getStorage, ref } from 'firebase/storage';

export default function StorageDebug() {
    const testStorage = async () => {
        const storageApp = getStorageApp();
        const storage = storageApp ? getStorage(storageApp) : null;

        if (!storage) {
            return;
        }

        try {
            const testRef = ref(storage, 'test/test.jpg');
        } catch (error) {
            // Silent fail in production
        }
    };

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="p-4">
            <button onClick={testStorage} className="bg-blue-500 text-white p-2 rounded">
                Test Storage
            </button>
        </div>
    );
}
