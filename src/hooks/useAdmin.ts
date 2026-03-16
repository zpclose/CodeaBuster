'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export function useAdmin() {
  const { user, isUserLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const userDocRef = useMemoFirebase(() => 
    user && firestore ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);

  const { data: userProfile, isLoading: profileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (userLoading || profileLoading) {
      setLoading(true);
      return;
    }

    if (user && userProfile) {
      setIsAdmin(userProfile.role === 'admin');
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user, userProfile, userLoading, profileLoading]);

  return { isAdmin, loading };
}
