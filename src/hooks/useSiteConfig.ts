'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function useSiteConfig() {
  const firestore = useFirestore();
  
  const siteConfigRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'site-config', 'global-settings') : null,
    [firestore]);

  const { data: siteConfig, isLoading } = useDoc(siteConfigRef);

  return {
    siteConfig,
    logoUrl: siteConfig?.logoUrl || null,
    isLoading,
  };
}
