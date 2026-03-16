'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeAdminFirebase } from '@/firebase';

interface AdminFirebaseClientProviderProps {
    children: ReactNode;
}

export function AdminFirebaseClientProvider({ children }: AdminFirebaseClientProviderProps) {
    const firebaseServices = useMemo(() => {
        // Initialize separate "admin" Firebase app instance
        return initializeAdminFirebase();
    }, []);

    return (
        <FirebaseProvider
            firebaseApp={firebaseServices.firebaseApp}
            auth={firebaseServices.auth}
            firestore={firebaseServices.firestore}
        >
            {children}
        </FirebaseProvider>
    );
}
