'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const email = searchParams.get('email');

    console.log('Auth action:', { mode, oobCode, email });

    if (!oobCode || !mode) {
      router.replace('/login');
      return;
    }

    if (mode === 'verifyEmail') {
      router.replace(`/verify-email?mode=verifyEmail&oobCode=${oobCode}&email=${encodeURIComponent(email || '')}`);
    } else if (mode === 'verifyAndChangeEmail') {
      router.replace(`/verify-email?mode=verifyAndChangeEmail&oobCode=${oobCode}&email=${encodeURIComponent(email || '')}`);
    } else if (mode === 'resetPassword') {
      router.replace(`/reset-password?mode=resetPassword&oobCode=${oobCode}&email=${encodeURIComponent(email || '')}`);
    } else if (mode === 'recoverEmail') {
      router.replace('/login');
    } else {
      router.replace('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Memproses...</p>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AuthActionContent />
    </Suspense>
  );
}
