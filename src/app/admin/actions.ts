'use server';

import { cookies, headers } from 'next/headers';
import { verifyAdminLogin } from '@/lib/admin-utils';
import { detectAnomaly } from '@/lib/anomaly';
import { sendLoginAlert } from '@/lib/alerts';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

function generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function adminLogin(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: 'Email dan password harus diisi.' };
    }

    // Verify admin credentials via Firestore
    const admin = await verifyAdminLogin(email, password);

    if (!admin) {
        return { success: false, error: 'Email atau password admin tidak valid.' };
    }

    // --- ANOMALY DETECTION START ---
    if (!firebaseConfig) {
        throw new Error('Firebase not configured');
    }
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const firestore = getFirestore(app);

    try {
        const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = (await headers()).get('user-agent') || 'Unknown';

        const adminDocRef = doc(firestore, 'system', 'admin_auth');
        let adminData: any = {};

        try {
            const adminDoc = await getDoc(adminDocRef);
            adminData = adminDoc.exists() ? adminDoc.data() : {};
        } catch (err) {
            console.warn('[SECURITY] Failed to fetch admin state:', err);
        }

        const isAnomaly = await detectAnomaly({
            currentIP: ip,
            previousIP: adminData.lastLoginIP,
            currentUA: userAgent,
            previousUA: adminData.lastLoginUA,
            lastLoginAt: adminData.lastLoginAt?.toMillis(),
        });

        if (isAnomaly) {
            console.warn(`[SECURITY] Anomaly detected for admin login from ${ip}`);
            const alertEmail = 'admin@example.com';
            let country = 'Unknown';

            sendLoginAlert({
                email: alertEmail,
                ip,
                country,
                userAgent,
            }).catch(err => console.error('Failed to send alert:', err));
        }

        await setDoc(adminDocRef, {
            lastLoginIP: ip,
            lastLoginUA: userAgent,
            lastLoginAt: Timestamp.now(),
            lastLoginEmail: email,
        }, { merge: true });
    } catch (error) {
        console.error('[SECURITY] Error running security checks:', error);
    }
    // --- ANOMALY DETECTION END ---

    // Generate secure session token
    const sessionToken = generateSecureToken();
    const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store token in Firestore for server-side verification
    try {
        const tokenRef = doc(firestore, 'system', `session_${sessionToken.substring(0, 8)}`);
        await setDoc(tokenRef, {
            email: admin.email,
            role: admin.role,
            createdAt: Timestamp.now(),
            expiresAt: tokenExpiry,
            ip: (await headers()).get('x-forwarded-for')?.split(',')[0] || 'unknown',
        }, { merge: true });
    } catch (err) {
        console.warn('[SECURITY] Failed to store session token:', err);
    }

    const cookieStore = await cookies();

    // Set admin session cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    };

    cookieStore.set('admin-session', 'true', cookieOptions);
    cookieStore.set('admin-email', admin.email, cookieOptions);
    cookieStore.set('admin-role', admin.role, cookieOptions);
    cookieStore.set('admin-name', admin.displayName, cookieOptions);
    cookieStore.set('admin-token', sessionToken, cookieOptions);

    return {
        success: true,
        admin: {
            email: admin.email,
            role: admin.role,
            displayName: admin.displayName,
        }
    };
}

export async function adminLogout() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    // Delete session token from Firestore
    if (token) {
        try {
            const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
            const { initializeApp, getApps } = await import('firebase/app');
            const app = getApps().length === 0 ? initializeApp(firebaseConfig!) : getApps()[0];
            const firestore = getFirestore(app);
            await deleteDoc(doc(firestore, 'system', `session_${token.substring(0, 8)}`));
        } catch (err) {
            console.warn('[SECURITY] Failed to delete session token:', err);
        }
    }

    cookieStore.delete('admin-session');
    cookieStore.delete('admin-email');
    cookieStore.delete('admin-role');
    cookieStore.delete('admin-name');
    cookieStore.delete('admin-token');
    return { success: true };
}
export async function setAdminSession(admin: { email: string; role: string; displayName: string }) {
    const sessionToken = generateSecureToken();
    const cookieStore = await cookies();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    };

    cookieStore.set('admin-session', 'true', cookieOptions);
    cookieStore.set('admin-email', admin.email, cookieOptions);
    cookieStore.set('admin-role', admin.role, cookieOptions);
    cookieStore.set('admin-name', admin.displayName, cookieOptions);
    cookieStore.set('admin-token', sessionToken, cookieOptions);

    return { success: true };
}
