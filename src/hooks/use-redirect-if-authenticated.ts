
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

/**
 * A custom hook to redirect the user to a specified path if they are authenticated.
 * @param redirectPath The path to redirect to if the user is authenticated.
 */
export function useRedirectIfAuthenticated(redirectPath: string) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // We don't want to redirect while loading, as the user state is not yet known.
    if (isUserLoading) {
      return;
    }

    // If loading is finished and the user is authenticated and verified, redirect them.
    if (user && user.emailVerified) {
      router.push(redirectPath);
    }
  }, [user, isUserLoading, router, redirectPath]);
}
