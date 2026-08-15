import { useEffect, useState } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { LiveEvent, LiveEventStatus } from '@/types/content';

interface UseLiveEventsOptions {
    visibleOnly?: boolean;
    status?: LiveEventStatus;
    limit?: number;
}

export function useLiveEvents(options: UseLiveEventsOptions = {}) {
    const firestore = useFirestore();
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setEvents([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Simple query without composite indexes — filter client-side instead
        const q = query(collection(firestore, 'live-events'), orderBy('eventDate', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                let list: LiveEvent[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as LiveEvent));

                // Filter client-side
                if (options.visibleOnly) {
                    list = list.filter(e => e.isVisible === true);
                }
                if (options.status) {
                    list = list.filter(e => e.status === options.status);
                }

                // Apply displayLimit dari event pertama (setting global)
                if (options.visibleOnly && list.length > 0) {
                    const limit = list[0].displayLimit || 3;
                    list = list.slice(0, options.limit ?? limit);
                }

                setEvents(list);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useLiveEvents] Error:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.visibleOnly, options.status, options.limit]);

    return { events, isLoading, error };
}
