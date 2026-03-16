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
import type { PageImage, PageName } from '@/types/content';

interface UsePageImagesOptions {
    pageName?: PageName;
    section?: string;
    activeOnly?: boolean;
}

export function usePageImages(options: UsePageImagesOptions = {}) {
    const firestore = useFirestore();
    const [images, setImages] = useState<PageImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setImages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Build query constraints
        const constraints: QueryConstraint[] = [];

        if (options.pageName) {
            constraints.push(where('pageName', '==', options.pageName));
        }

        if (options.section) {
            constraints.push(where('section', '==', options.section));
        }

        if (options.activeOnly) {
            constraints.push(where('isActive', '==', true));
        }

        // Order by order field
        constraints.push(orderBy('order', 'asc'));

        const imagesQuery = query(
            collection(firestore, 'page-images'),
            ...constraints
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            imagesQuery,
            (snapshot) => {
                const imagesList: PageImage[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as PageImage));

                setImages(imagesList);
                setIsLoading(false);
            },
            (err) => {
                console.error('[usePageImages] Error fetching images:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, options.pageName, options.section, options.activeOnly]);

    return {
        images,
        isLoading,
        error,
    };
}
