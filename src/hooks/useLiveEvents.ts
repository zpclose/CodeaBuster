import { useEffect, useState } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe,
    QueryConstraint,
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

        const constraints: QueryConstraint[] = [];

        if (options.visibleOnly) {
            constraints.push(where('isVisible', '==', true));
        }

        if (options.status) {
            constraints.push(where('status', '==', options.status));
        }

        constraints.push(orderBy('order', 'asc'));
        constraints.push(orderBy('eventDate', 'desc'));

        const q = query(collection(firestore, 'live-events'), ...constraints);

        const unsubscribe: Unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                let list: LiveEvent[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as LiveEvent));

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
