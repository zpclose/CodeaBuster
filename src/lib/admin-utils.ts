'use server';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
    getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, serverTimestamp, Timestamp, type Firestore
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import bcrypt from 'bcryptjs';

// --- Types ---
export interface AdminUser {
    id: string;
    email: string;
    passwordHash: string;
    role: 'owner' | 'admin';
    displayName: string;
    createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
    updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
}

export type AdminUserPublic = Omit<AdminUser, 'passwordHash'>;

// --- Owner Config ---
const OWNER_EMAIL = 'growidbapak@gmail.com';
const OWNER_DEFAULT_PASSWORD = 'owners';
const OWNER_DISPLAY_NAME = 'Owner';
const ADMIN_COLLECTION = 'admin-users';

// --- Firebase Helper ---
function getServerFirestore(): Firestore {
    let app: FirebaseApp;
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig!);
    } else {
        app = getApp();
    }
    return getFirestore(app);
}

// --- Seed Owner ---
async function seedOwnerIfNeeded(firestore: Firestore): Promise<void> {
    const ownerDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, OWNER_EMAIL));
    if (!ownerDoc.exists()) {
        const passwordHash = await bcrypt.hash(OWNER_DEFAULT_PASSWORD, 10);
        await setDoc(doc(firestore, ADMIN_COLLECTION, OWNER_EMAIL), {
            email: OWNER_EMAIL,
            passwordHash,
            role: 'owner',
            displayName: OWNER_DISPLAY_NAME,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('[ADMIN] Owner account seeded:', OWNER_EMAIL);
    }
}

export async function resetOwnerPassword(): Promise<{ success: boolean; message: string }> {
    const firestore = getServerFirestore();
    const passwordHash = await bcrypt.hash(OWNER_DEFAULT_PASSWORD, 10);
    
    try {
        await updateDoc(doc(firestore, ADMIN_COLLECTION, OWNER_EMAIL), {
            passwordHash,
            updatedAt: serverTimestamp(),
        });
        return { success: true, message: 'Password owner berhasil diperbarui' };
    } catch (error) {
        // If doc doesn't exist, create it
        await setDoc(doc(firestore, ADMIN_COLLECTION, OWNER_EMAIL), {
            email: OWNER_EMAIL,
            passwordHash,
            role: 'owner',
            displayName: OWNER_DISPLAY_NAME,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, message: 'Akun owner berhasil dibuat dengan password baru' };
    }
}

// --- Auth ---
export async function verifyAdminLogin(email: string, password: string): Promise<AdminUserPublic | null> {
    const firestore = getServerFirestore();

    // Seed owner on first ever login attempt
    await seedOwnerIfNeeded(firestore);

    const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
    if (!adminDoc.exists()) return null;

    const adminData = adminDoc.data() as Omit<AdminUser, 'id'>;
    const isMatch = await bcrypt.compare(password, adminData.passwordHash);
    if (!isMatch) return null;

    return {
        id: adminDoc.id,
        email: adminData.email,
        role: adminData.role,
        displayName: adminData.displayName,
        createdAt: adminData.createdAt,
        updatedAt: adminData.updatedAt,
    };
}

// --- Session Verification ---
export async function verifyAdminSession(email: string): Promise<boolean> {
    const firestore = getServerFirestore();
    const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
    return adminDoc.exists();
}
export async function getAllAdmins(): Promise<AdminUserPublic[]> {
    const firestore = getServerFirestore();
    const snapshot = await getDocs(collection(firestore, ADMIN_COLLECTION));
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            email: data.email,
            role: data.role,
            displayName: data.displayName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        } as AdminUserPublic;
    });
}

export async function createAdmin(email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> {
    const firestore = getServerFirestore();

    // Check if already exists
    const existing = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
    if (existing.exists()) {
        return { success: false, error: 'Admin dengan email ini sudah ada.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await setDoc(doc(firestore, ADMIN_COLLECTION, email), {
        email,
        passwordHash,
        role: 'admin',
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

export async function updateAdmin(
    email: string,
    data: { displayName?: string; password?: string }
): Promise<{ success: boolean; error?: string }> {
    const firestore = getServerFirestore();

    const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
    if (!adminDoc.exists()) {
        return { success: false, error: 'Admin tidak ditemukan.' };
    }

    // Cannot change owner role
    const adminData = adminDoc.data();
    if (adminData.role === 'owner' && data.password) {
        // Owner can change their own password
    }

    const updateData: Record<string, any> = { updatedAt: serverTimestamp() };
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

    await updateDoc(doc(firestore, ADMIN_COLLECTION, email), updateData);
    return { success: true };
}

export async function deleteAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    const firestore = getServerFirestore();

    const adminDoc = await getDoc(doc(firestore, ADMIN_COLLECTION, email));
    if (!adminDoc.exists()) {
        return { success: false, error: 'Admin tidak ditemukan.' };
    }

    // Cannot delete owner
    if (adminDoc.data().role === 'owner') {
        return { success: false, error: 'Tidak dapat menghapus akun Owner.' };
    }

    await deleteDoc(doc(firestore, ADMIN_COLLECTION, email));
    return { success: true };
}
