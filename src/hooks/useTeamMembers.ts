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
import type { TeamMember, TeamMemberTier } from '@/types/content';

interface UseTeamMembersOptions {
    tier?: TeamMemberTier;
    university?: string;
    activeOnly?: boolean;
}

export function useTeamMembers(options: UseTeamMembersOptions = {}) {
    const firestore = useFirestore();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setMembers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Build query constraints
        const constraints: QueryConstraint[] = [];

        if (options.tier) {
            constraints.push(where('tier', '==', options.tier));
        }

        if (options.university) {
            constraints.push(where('university', '==', options.university));
        }

        if (options.activeOnly) {
            constraints.push(where('isActive', '==', true));
        }

        // Always order by order field
        constraints.push(orderBy('order', 'asc'));

        const membersQuery = query(
            collection(firestore, 'team-members'),
            ...constraints
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            membersQuery,
            (snapshot) => {
                const membersList: TeamMember[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as TeamMember));

                setMembers(membersList);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useTeamMembers] Error fetching members:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.tier, options.university, options.activeOnly]);

    return {
        members,
        isLoading,
        error,
    };
}
