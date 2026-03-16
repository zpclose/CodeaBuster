import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface DynamicImageResult {
    imageUrl: string;
    description: string;
    imageHint: string;
    isCustom: boolean;
    updatedAt?: number;
}

type ImageMap = Record<string, DynamicImageResult>;

/**
 * Loads all page-images overrides from Firestore for a given page category.
 * Returns a merged map: Firestore override wins over placeholder JSON fallback.
 *
 * Usage:
 *   const images = useDynamicPageImages('home');
 *   const img = images['hero-background-main'];
 *   <Image src={img.imageUrl} ... />
 */
interface FirestoreOverrideData {
    imageUrl: string;
    updatedAt?: number;
}

export function useDynamicPageImages(pageCategory?: string): { images: ImageMap; isLoading: boolean } {
    const firestore = useFirestore();
    const [overrides, setOverrides] = useState<Record<string, FirestoreOverrideData>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        setIsLoading(true);
        const q = pageCategory
            ? query(collection(firestore, 'page-images'))
            : query(collection(firestore, 'page-images'));

        getDocs(q).then(snapshot => {
            const map: Record<string, FirestoreOverrideData> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!pageCategory || data.pageCategory === pageCategory) {
                    if (data.slot && data.imageUrl && data.isActive !== false) {
                        map[data.slot] = {
                            imageUrl: data.imageUrl,
                            updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
                        };
                    }
                }
            });
            setOverrides(map);
            setIsLoading(false);
        }).catch(err => {
            console.warn('[useDynamicPageImages] Failed to load overrides:', err);
            setIsLoading(false);
        });
    }, [firestore, pageCategory]);

    // Build merged map: Firestore override → placeholder fallback
    // Add cache-busting only when override exists (to prevent caching old images)
    const result: ImageMap = {};
    for (const placeholder of PlaceHolderImages) {
        const override = overrides[placeholder.id];
        const imageUrl = override?.imageUrl ?? placeholder.imageUrl;
        const version = override?.updatedAt;
        result[placeholder.id] = {
            imageUrl: (version && imageUrl) ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${version}` : imageUrl,
            description: placeholder.description,
            imageHint: placeholder.imageHint,
            isCustom: !!override,
            updatedAt: override?.updatedAt,
        };
    }
    return { images: result, isLoading };
}

/**
 * Convenience: get a single image slot by ID with override support.
 * Synchronous (no async), relies on the images map from useDynamicPageImages.
 */
export function getImage(images: ImageMap, slotId: string): DynamicImageResult | undefined {
    return images[slotId];
}
