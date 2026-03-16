'use client';

import { getStorageApp } from '@/firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function StorageDebug() {
    const testStorage = async () => {
        console.log('🔍 Testing storage...');
        const storageApp = getStorageApp();
        const storage = storageApp ? getStorage(storageApp) : null;
        console.log('Storage instance:', storage);

        if (!storage) {
            console.error('❌ Storage is null/undefined');
            return;
        }

        try {
            const testRef = ref(storage, 'test/test.jpg');
            console.log('✅ Storage ref created:', testRef);
            console.log('App name:', storage.app.name);
        } catch (error) {
            console.error('❌ Storage ref error:', error);
        }
    };

    return (
        <div className="p-4">
            <button onClick={testStorage} className="bg-blue-500 text-white p-2 rounded">
                Test Storage
            </button>
            <p className="mt-2 text-sm text-gray-600">
                Check browser console for debug info
            </p>
        </div>
    );
}