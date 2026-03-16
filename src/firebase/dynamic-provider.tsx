'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeAdminFirebase, initializeFirebase } from '@/firebase';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

interface DynamicFirebaseProviderProps {
    children: ReactNode;
}

/**
 * Centrally manages Firebase isolation based on the current route.
 * - Routes starting with /admin use the 'admin' Firebase app.
 * - All other routes use the default '[DEFAULT]' Firebase app.
 */
export function DynamicFirebaseProvider({ children }: DynamicFirebaseProviderProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    // We want to re-initialize ONLY when switching between admin and public portals
    const firebaseServices = useMemo(() => {
        if (isAdmin) {
            return initializeAdminFirebase();
        } else {
            return initializeFirebase();
        }
    }, [isAdmin]);

    // Handle dynamic favicon update from database logo
    useEffect(() => {
        const firestore = firebaseServices.firestore;
        if (!firestore) return;

        const fetchLogo = async () => {
            try {
                const snap = await getDoc(doc(firestore, 'page-images', 'site-logo'));
                if (snap.exists() && snap.data()?.imageUrl) {
                    const logoUrl = snap.data().imageUrl;
                    
                    // Update favicon links
                    const links = document.querySelectorAll("link[rel*='icon']");
                    links.forEach(link => {
                        (link as HTMLLinkElement).href = logoUrl;
                    });

                    // If no links exist, create one
                    if (links.length === 0) {
                        const link = document.createElement('link');
                        link.rel = 'icon';
                        link.href = logoUrl;
                        document.head.appendChild(link);
                    }
                }
            } catch (err) {
                console.warn('[DynamicFirebaseProvider] Favicon sync failed:', err);
            }
        };

        fetchLogo();
    }, [firebaseServices.firestore]);

    return (
        <FirebaseProvider
            key={isAdmin ? 'admin-provider' : 'public-provider'}
            firebaseApp={firebaseServices.firebaseApp}
            auth={firebaseServices.auth}
            firestore={firebaseServices.firestore}
        >
            {children}
        </FirebaseProvider>
    );
}
