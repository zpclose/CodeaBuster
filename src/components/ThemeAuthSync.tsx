'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Handles theme synchronization for the USER PORTAL only.
 * - Enforces LIGHT on logout.
 * - Syncs from FIRESTORE on login.
 * - Allows MANUAL change while logged in.
 */
export function ThemeAuthSync() {
    const { setTheme } = useTheme();
    // IMPORTANT: Since we are using DynamicFirebaseProvider, researchers and users 
    // will only get the 'user' if they are logged in on the app currently active 
    // (DEFAULT for public, admin for /admin).
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Track the previous user ID to detect login/logout transitions
    const prevUserId = useRef<string | undefined>(undefined);
    // Track the last theme synced from Firestore to avoid overriding manual user changes
    const lastSyncedTheme = useRef<string | null>(null);

    const userDocRef = useMemoFirebase(() =>
        user && firestore ? doc(firestore, 'users', user.uid) : null,
        [user, firestore]
    );

    const { data: userProfile, isLoading: profileLoading } = useDoc(userDocRef);

    useEffect(() => {
        // Wait for auth and profile to be ready
        if (isUserLoading || profileLoading) return;

        const currentUserId = user?.uid;

        // 1. LOGOUT TRANSITION
        // If user was logged in and is now logged out
        if (prevUserId.current && !currentUserId) {
            setTheme('light');
            lastSyncedTheme.current = null;
        }

        // 2. LOGIN TRANSITION OR CLOUD UPDATE
        // If user just logged in, or if their cloud preference changed
        if (currentUserId && userProfile?.preferences?.theme) {
            const cloudTheme = userProfile.preferences.theme;

            // Force sync if:
            // a) User just logged in (prevUserId was different)
            // b) The cloud preference itself changed (e.g. changed on another device/tab)
            if (currentUserId !== prevUserId.current || cloudTheme !== lastSyncedTheme.current) {
                setTheme(cloudTheme);
                lastSyncedTheme.current = cloudTheme;
            }
        }

        // Update trackers for next run
        prevUserId.current = currentUserId;

    }, [user, isUserLoading, userProfile, profileLoading, setTheme]);

    return null;
}
