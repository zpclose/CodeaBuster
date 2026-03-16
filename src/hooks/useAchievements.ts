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
import type { Achievement, AchievementCategory } from '@/types/content';

interface UseAchievementsOptions {
    category?: AchievementCategory;
    year?: number;
    hallOfFameOnly?: boolean;
    activeOnly?: boolean;
}

export function useAchievements(options: UseAchievementsOptions = {}) {
    const firestore = useFirestore();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setAchievements([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Build query constraints
        const constraints: QueryConstraint[] = [];

        if (options.category) {
            constraints.push(where('category', '==', options.category));
        }

        if (options.year) {
            constraints.push(where('year', '==', options.year));
        }

        if (options.hallOfFameOnly) {
            constraints.push(where('isHallOfFame', '==', true));
        }

        if (options.activeOnly) {
            constraints.push(where('isActive', '==', true));
        }

        // Order by year descending, then by order
        constraints.push(orderBy('year', 'desc'));
        constraints.push(orderBy('order', 'asc'));

        const achievementsQuery = query(
            collection(firestore, 'achievements'),
            ...constraints
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            achievementsQuery,
            (snapshot) => {
                const achievementsList: Achievement[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Achievement));

                setAchievements(achievementsList);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useAchievements] Error fetching achievements:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.category, options.year, options.hallOfFameOnly, options.activeOnly]);

    return {
        achievements,
        isLoading,
        error,
    };
}
