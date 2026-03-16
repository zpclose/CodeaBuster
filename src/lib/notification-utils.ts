import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import type { Notification } from '@/types/notification';
import type { ProposalStatus } from '@/types/project';

/**
 * Generate user-friendly notification message based on proposal status
 */
export function getNotificationMessage(status: ProposalStatus, adminComment?: string): { title: string; message: string } {
    switch (status) {
        case 'In Review':
            return {
                title: 'Proposal Sedang Ditinjau',
                message: adminComment || 'Proposal Anda sedang dalam proses peninjauan oleh admin.'
            };
        case 'Approved':
            return {
                title: '🎉 Proposal Disetujui!',
                message: adminComment || 'Selamat! Proposal Anda telah disetujui. Tim akan menghubungi Anda segera.'
            };
        case 'Rejected':
            return {
                title: '❌ Proposal Ditolak',
                message: adminComment || 'Mohon maaf, proposal Anda tidak dapat dilanjutkan saat ini.'
            };
        case 'In Progress':
            return {
                title: '  Proyek Sedang Dikerjakan',
                message: adminComment || 'Proyek Anda sedang dalam tahap pengerjaan.'
            };
        case 'Completed':
            return {
                title: '✅ Proyek Selesai',
                message: adminComment || 'Selamat! Proyek Anda telah selesai dikerjakan.'
            };
        case 'Submitted':
        default:
            return {
                title: 'Proposal Terkirim',
                message: adminComment || 'Proposal Anda telah diterima dan akan segera ditinjau.'
            };
    }
}

/**
 * Create or update notification for a proposal
 * This prevents creating multiple notifications for the same proposal
 */
export async function upsertNotification(
    firestore: Firestore,
    data: {
        userId: string;
        proposalId: string;
        proposalName: string;
        status: ProposalStatus;
        adminComment?: string;
    }
): Promise<void> {
    const { title, message } = getNotificationMessage(data.status, data.adminComment);

    // Calculate expiration date (30 days from now)
    const now = new Date();
    const expireDate = new Date();
    expireDate.setDate(now.getDate() + 30);

    const notificationData: Omit<Notification, 'id'> = {
        userId: data.userId,
        proposalId: data.proposalId,
        proposalName: data.proposalName,
        type: 'proposal_status_change',
        title,
        message,
        status: data.status,
        isRead: false, // Reset to unread when updated
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expireDate), // TTL field
    };

    // Check if notification already exists for this proposal
    const notificationsCollection = collection(firestore, 'notifications');
    const { query: firestoreQuery, where, getDocs } = await import('firebase/firestore');

    const existingQuery = firestoreQuery(
        notificationsCollection,
        where('userId', '==', data.userId),
        where('proposalId', '==', data.proposalId)
    );

    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
        // Update existing notification
        const existingDoc = existingDocs.docs[0];
        await updateDoc(doc(firestore, 'notifications', existingDoc.id), {
            ...notificationData,
            createdAt: serverTimestamp(), // Update timestamp
            expiresAt: Timestamp.fromDate(expireDate), // Reset TTL
        });
    } else {
        // Create new notification
        await addDoc(notificationsCollection, notificationData);
    }
}

/**
 * Create a new notification with TTL (auto-delete after 30 days)
 */
export async function createNotification(
    firestore: Firestore,
    data: {
        userId: string;
        proposalId: string;
        proposalName: string;
        status: ProposalStatus;
        adminComment?: string;
    }
): Promise<void> {
    const { title, message } = getNotificationMessage(data.status, data.adminComment);

    // Calculate expiration date (30 days from now)
    const now = new Date();
    const expireDate = new Date();
    expireDate.setDate(now.getDate() + 30); // Auto-delete after 30 days

    const notificationData: Omit<Notification, 'id'> = {
        userId: data.userId,
        proposalId: data.proposalId,
        proposalName: data.proposalName,
        type: 'proposal_status_change',
        title,
        message,
        status: data.status,
        isRead: false,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expireDate), // TTL field
    };

    const notificationsCollection = collection(firestore, 'notifications');
    await addDoc(notificationsCollection, notificationData);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
    firestore: Firestore,
    notificationId: string
): Promise<void> {
    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        isRead: true,
    });
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(
    firestore: Firestore,
    notifications: Notification[]
): Promise<void> {
    const unreadNotifications = notifications.filter(n => !n.isRead);

    const updatePromises = unreadNotifications.map(notification =>
        markNotificationAsRead(firestore, notification.id)
    );

    await Promise.all(updatePromises);
}

/**
 * Delete a notification
 */
export async function deleteNotification(
    firestore: Firestore,
    notificationId: string
): Promise<void> {
    const notificationRef = doc(firestore, 'notifications', notificationId);
    await deleteDoc(notificationRef);
}
