'use server';

import { cookies, headers } from 'next/headers';
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import bcrypt from 'bcryptjs';

function generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function checkAndSetAdminSession(email: string): Promise<{ isAdmin: boolean; role?: string; displayName?: string }> {
    const ADMIN_COLLECTION = 'admin-users';
    
    try {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig!) : getApps()[0];
        const firestore = getFirestore(app);

        const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email.toLowerCase()));
        
        if (!adminDoc.exists()) {
            return { isAdmin: false };
        }

        const adminData = adminDoc.data();
        const role = adminData.role;
        const displayName = adminData.displayName;

        // Generate session token
        const sessionToken = generateSecureToken();
        
        const cookieStore = await cookies();
        const cookieOptions = {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        };

        // Set admin session cookies
        cookieStore.set('admin-session', 'true', cookieOptions);
        cookieStore.set('admin-email', email.toLowerCase(), cookieOptions);
        cookieStore.set('admin-role', role, cookieOptions);
        cookieStore.set('admin-name', displayName, cookieOptions);
        cookieStore.set('admin-token', sessionToken, cookieOptions);

        return {
            isAdmin: true,
            role,
            displayName
        };
    } catch (error) {
        console.error('[checkAndSetAdminSession] Error:', error);
        return { isAdmin: false };
    }
}

export async function adminLogin(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: 'Email dan password harus diisi.' };
    }

    const ADMIN_COLLECTION = 'admin-users';
    
    try {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig!) : getApps()[0];
        const firestore = getFirestore(app);

        // Check if admin exists in Firestore
        const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
        
        if (!adminDoc.exists()) {
            return { success: false, error: 'Email atau password admin tidak valid.' };
        }

        const adminData = adminDoc.data();
        const isMatch = await bcrypt.compare(password, adminData.passwordHash);
        
        if (!isMatch) {
            return { success: false, error: 'Email atau password admin tidak valid.' };
        }

        // Generate session token
        const sessionToken = generateSecureToken();
        
        const cookieStore = await cookies();
        const cookieOptions = {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        };

        // Set admin session cookies
        cookieStore.set('admin-session', 'true', cookieOptions);
        cookieStore.set('admin-email', email, cookieOptions);
        cookieStore.set('admin-role', adminData.role, cookieOptions);
        cookieStore.set('admin-name', adminData.displayName, cookieOptions);
        cookieStore.set('admin-token', sessionToken, cookieOptions);

        return {
            success: true,
            admin: {
                email: adminData.email,
                role: adminData.role,
                displayName: adminData.displayName,
            }
        };
    } catch (error) {
        console.error('[adminLogin] Error:', error);
        return { success: false, error: 'Terjadi kesalahan saat login.' };
    }
}
