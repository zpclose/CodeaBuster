import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface StrictImageResult {
    /** Admin image URL, null if not set or still loading */
    adminUrl: string | null;
    /** Placeholder URL sebagai fallback */
    placeholderUrl: string;
    /** Description dari placeholder */
    description: string;
    imageHint: string;
    /** Apakah admin sudah set custom image */
    isCustom: boolean;
    /** Masih loading dari Firestore */
    isLoading: boolean;
    updatedAt?: number;
}

type StrictImageMap = Record<string, StrictImageResult>;

/**
 * STRICT VERSION: useStrictPageImages
 * 
 * PERUBAHAN DARI useDynamicPageImages:
 * - adminUrl adalah null saat isLoading = true (tidak pernah return placeholder saat loading)
 * - Ini mencegah flash default image
 * - Component harus menunggu isLoading = false sebelum menampilkan image
 * 
 * Usage:
 *   const { images, isLoading } = useStrictPageImages('home');
 *   const hero = images['hero-background-main'];
 *   
 *   // Di component:
 *   <AdminImage 
 *     adminSrc={hero.adminUrl}  // null saat loading
 *     defaultSrc={hero.placeholderUrl}
 *     isLoading={hero.isLoading}
 *   />
 */
interface FirestoreOverrideData {
    imageUrl: string;
    updatedAt?: number;
}

export function useStrictPageImages(pageCategory?: string): { 
    images: StrictImageMap; 
    isLoading: boolean;
    allSlots: string[];
} {
    const firestore = useFirestore();
    const [overrides, setOverrides] = useState<Record<string, FirestoreOverrideData>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const q = query(collection(firestore, 'page-images'));

        getDocs(q).then(snapshot => {
            const map: Record<string, FirestoreOverrideData> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                // Support both pageCategory filter and global images
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
            console.warn('[useStrictPageImages] Failed to load overrides:', err);
            setIsLoading(false);
        });
    }, [firestore, pageCategory]);

    // Build result: adminUrl = null saat loading, placeholderUrl selalu tersedia
    const result: StrictImageMap = {};
    const allSlotIds: string[] = [];
    
    for (const placeholder of PlaceHolderImages) {
        allSlotIds.push(placeholder.id);
        const override = overrides[placeholder.id];
        const hasOverride = !!override?.imageUrl;
        
        // Cache-busting untuk admin image
        const adminUrl = hasOverride && !isLoading
            ? `${override.imageUrl}${override.imageUrl.includes('?') ? '&' : '?'}v=${override.updatedAt}`
            : null;
        
        result[placeholder.id] = {
            adminUrl: isLoading ? null : adminUrl,
            placeholderUrl: placeholder.imageUrl,
            description: placeholder.description,
            imageHint: placeholder.imageHint,
            isCustom: hasOverride,
            isLoading,
            updatedAt: override?.updatedAt,
        };
    }
    
    return { 
        images: result, 
        isLoading,
        allSlots: allSlotIds
    };
}

/**
 * Helper untuk mengambil single slot dengan type safety
 */
export function getStrictImage(
    images: StrictImageMap, 
    slotId: string
): StrictImageResult | undefined {
    return images[slotId];
}

/**
 * Helper untuk mendapatkan final URL (admin优先, fallback ke placeholder)
 * HANYA gunakan ini setelah isLoading = false
 */
export function getFinalImageUrl(
    image: StrictImageResult | undefined
): { url: string; isAdmin: boolean } {
    if (!image) return { url: '', isAdmin: false };
    return {
        url: image.adminUrl || image.placeholderUrl,
        isAdmin: !!image.adminUrl,
    };
}
