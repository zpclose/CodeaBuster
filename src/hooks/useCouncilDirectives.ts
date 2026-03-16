
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
import type { CouncilDirective, DirectiveStatus } from '@/types/content';

interface UseCouncilDirectivesOptions {
    status?: DirectiveStatus;
    activeOnly?: boolean;
}

export function useCouncilDirectives(options: UseCouncilDirectivesOptions = {}) {
    const firestore = useFirestore();
    const [directives, setDirectives] = useState<CouncilDirective[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setDirectives([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Build query constraints
        const constraints: QueryConstraint[] = [];

        if (options.status) {
            constraints.push(where('status', '==', options.status));
        }

        if (options.activeOnly) {
            constraints.push(where('isActive', '==', true));
        }

        // Always order by order field
        constraints.push(orderBy('order', 'asc'));

        const directivesQuery = query(
            collection(firestore, 'council-directives'),
            ...constraints
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            directivesQuery,
            (snapshot) => {
                const directivesList: CouncilDirective[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as CouncilDirective));

                setDirectives(directivesList);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useCouncilDirectives] Error fetching directives:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.status, options.activeOnly]);

    return {
        directives,
        isLoading,
        error,
    };
}
