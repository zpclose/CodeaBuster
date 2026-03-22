'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, applyActionCode, checkActionCode, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, getDoc, getFirestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import Link from 'next/link';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CodeConnectLogo } from '@/components/icons';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending-login'>('loading');
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [siteLogo, setSiteLogo] = useState<string | null | undefined>(undefined);
  const authImage = PlaceHolderImages.find(p => p.id === 'auth-visual');

  useEffect(() => {
    getDoc(doc(getFirestore(), 'page-images', 'site-logo')).then((snap) => {
      if (snap.exists() && snap.data()?.imageUrl) {
        setSiteLogo(snap.data().imageUrl);
      } else {
        setSiteLogo(null);
      }
    });
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setStatus('error');
      setMessage('Link verifikasi tidak valid.');
      return;
    }

    const auth = getAuth();
    const db = getFirestore();

    const handleAuthError = (error: any) => {
      setStatus('error');
      if (error.code === 'auth/expired-action-code') {
        setMessage('Link sudah expired. Minta link baru.');
      } else if (error.code === 'auth/invalid-action-code') {
        setMessage('Link tidak valid.');
      } else if (error.code === 'auth/user-disabled') {
        setMessage('Akun ini telah dinonaktifkan.');
      } else {
        setMessage('Terjadi kesalahan sistem.');
        console.error('Verify error:', error);
      }
    };

    if (mode === 'verifyAndChangeEmail') {
      checkActionCode(auth, oobCode)
        .then((info) => {
          const newEmail = info.data.email || '';
          setPendingEmail(newEmail);

          // For email change, the user MUST be logged in to apply the change to Firestore
          // We apply the auth change first
          return applyActionCode(auth, oobCode).then(() => newEmail);
        })
        .then(async (newEmail) => {
          // Check if user is logged in to sync Firestore
          if (auth.currentUser) {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              email: newEmail.toLowerCase()
            });
            setStatus('success');
            setMessage(`Email berhasil diperbarui ke ${newEmail}!`);
          } else {
            // If not logged in, we applied the change to Auth, but need them to login to sync Firestore
            // Or we just tell them it's successful and they should login.
            setStatus('success');
            setMessage(`Email berhasil diperbarui ke ${newEmail}. Silakan login kembali.`);
          }
        })
        .catch(handleAuthError);
    } else if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Silakan login.');
        })
        .catch(handleAuthError);
    } else {
      setStatus('error');
      setMessage('Mode tidak valid.');
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      {authImage && (
        <ImageWithSkeleton src={authImage.imageUrl} alt="Background" fill className="object-cover blur-xl saturate-150" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center space-y-4 pt-8">
            {siteLogo !== undefined && (
              siteLogo ? (
                <div className="relative h-12 w-12 mx-auto">
                  <ImageWithSkeleton src={siteLogo} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <CodeConnectLogo className="mx-auto h-12 w-12 text-primary" />
              )
            )}
            <div>
              <CardTitle className="font-headline text-2xl tracking-wider uppercase">
                {searchParams.get('mode') === 'verifyAndChangeEmail' ? 'Update Email' : 'Verifikasi Email'}
              </CardTitle>
              <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground animate-pulse">Memproses permintaan Anda...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/5">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-primary font-bold text-xl">Berhasil!</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                <Link href="/login" className="block w-full">
                  <Button className="w-full mt-4 font-bold py-6 text-lg">Login ke Akun</Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-destructive/5">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-bold text-xl">Verifikasi Gagal</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">Kembali ke Login</Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button variant="ghost" className="w-full text-muted-foreground">Butuh bantuan? Hubungi Support</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
