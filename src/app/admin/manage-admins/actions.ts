'use server';

import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/lib/admin-utils';

export async function fetchAdmins() {
    const admins = await getAllAdmins();
    // Serialize Timestamps for client
    return admins.map(a => ({
        ...a,
        createdAt: a.createdAt && 'seconds' in (a.createdAt as any)
            ? (a.createdAt as any).seconds * 1000
            : Date.now(),
        updatedAt: a.updatedAt && 'seconds' in (a.updatedAt as any)
            ? (a.updatedAt as any).seconds * 1000
            : Date.now(),
    }));
}

export async function addAdmin(email: string, password: string, displayName: string) {
    return createAdmin(email.trim().toLowerCase(), password, displayName.trim());
}

export async function editAdmin(email: string, data: { displayName?: string; password?: string }) {
    return updateAdmin(email, data);
}

export async function removeAdmin(email: string) {
    return deleteAdmin(email);
}
