'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';

export interface TickerItem {
  id: string;
  text: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export function useTickerItems() {
  const firestore = useFirestore();
  
  const query_ = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ticker-settings'), 
      orderBy('order', 'asc'),
      limit(20)
    );
  }, [firestore]);

  const { data, isLoading, error } = useCollection<TickerItem>(query_);

  const activeItems = useMemo(() => {
    if (!data) return [];
    return data.filter(item => item.isActive).sort((a, b) => a.order - b.order);
  }, [data]);

  return { items: data, activeItems, isLoading, error };
}
