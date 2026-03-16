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
import type { NetworkPartner, PartnerStatus } from '@/types/content';

interface UseNetworkPartnersOptions {
    region?: string;
    status?: PartnerStatus;
    activeOnly?: boolean;
}

export function useNetworkPartners(options: UseNetworkPartnersOptions = {}) {
    const firestore = useFirestore();
    const [partners, setPartners] = useState<NetworkPartner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setPartners([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Build query constraints
        const constraints: QueryConstraint[] = [];

        if (options.region) {
            constraints.push(where('region', '==', options.region));
        }

        if (options.status) {
            constraints.push(where('status', '==', options.status));
        }

        if (options.activeOnly) {
            constraints.push(where('isActive', '==', true));
        }

        // Order by established year descending, then by order
        constraints.push(orderBy('established', 'desc'));
        constraints.push(orderBy('order', 'asc'));

        const partnersQuery = query(
            collection(firestore, 'network-partners'),
            ...constraints
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            partnersQuery,
            (snapshot) => {
                const partnersList: NetworkPartner[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as NetworkPartner));

                setPartners(partnersList);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useNetworkPartners] Error fetching partners:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.region, options.status, options.activeOnly]);

    return {
        partners,
        isLoading,
        error,
    };
}
