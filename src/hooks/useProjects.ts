'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    query,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Project, ProjectCategory, ProjectStatus } from '@/types/content';

interface UseProjectsOptions {
    // Reserved for future use - currently not filtering
    category?: ProjectCategory;
    status?: ProjectStatus;
    activeOnly?: boolean;
    featuredOnly?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
    const firestore = useFirestore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            return;
        }
        
        setIsLoading(true);
        setError(null);

        const q = query(collection(firestore, 'projects'));

        const unsubscribe: Unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Project[];
                setProjects(data);
                setIsLoading(false);
            },
            (err) => {
                console.error('Error fetching projects:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore]);

    return { projects, isLoading, error };
}
