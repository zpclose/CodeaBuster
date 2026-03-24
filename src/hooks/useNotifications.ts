import { useEffect, useState, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Notification } from '@/types/notification';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification-utils';

const isDev = process.env.NODE_ENV === 'development';

export function useNotifications() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !user) {
            setNotifications([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        if (isDev) console.log('[useNotifications] Setting up listener for user:', user.uid);

        // Real-time listener untuk notifications user (without orderBy to avoid index requirement)
        const notificationsQuery = query(
            collection(firestore, 'notifications'),
            where('userId', '==', user.uid)
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                if (isDev) console.log('[useNotifications] Received snapshot, docs count:', snapshot.docs.length);
                const notificationsList: Notification[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));

                // Sort manually by createdAt descending
                notificationsList.sort((a, b) => {
                    const aTime = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
                    const bTime = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
                    return bTime - aTime;
                });

                setNotifications(notificationsList);
                setIsLoading(false);
            },
            (error) => {
                if (isDev) console.error('[useNotifications] Error fetching notifications:', error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, user]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!firestore) return;
        try {
            await markNotificationAsRead(firestore, notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [firestore]);

    const markAllAsRead = useCallback(async () => {
        if (!firestore) return;
        try {
            await markAllNotificationsAsRead(firestore, notifications);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [firestore, notifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
    };
}
