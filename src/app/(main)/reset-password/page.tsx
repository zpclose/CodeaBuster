'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, XCircle, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CodeConnectLogo } from '@/components/icons';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Minimal 6 karakter.' }),
  confirmPassword: z.string().min(6, { message: 'Minimal 6 karakter.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'form'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null | undefined>(undefined);
  const authImage = PlaceHolderImages.find(p => p.id === 'auth-visual');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    getDoc(doc(getFirestore(), 'page-images', 'site-logo')).then((snap) => {
      if (snap.exists() && snap.data()?.imageUrl) {
        setSiteLogo(snap.data().imageUrl);
      } else {
        setSiteLogo(null);
      }
    });
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      setMessage('Link tidak valid.');
      return;
    }

    const auth = getAuth();
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setStatus('form');
      })
      .catch((error) => {
        setStatus('error');
        if (error.code === 'auth/expired-action-code') {
          setMessage('Link expired. Minta link baru.');
        } else if (error.code === 'auth/invalid-action-code') {
          setMessage('Link tidak valid.');
        } else {
          setMessage('Terjadi kesalahan.');
        }
      });
  }, [oobCode]);

  async function onSubmit(values: FormValues) {
    if (!oobCode) return;
    setIsSubmitting(true);
    const auth = getAuth();

    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setStatus('success');
    } catch (error) {
      setMessage('Terjadi kesalahan.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      {authImage && <ImageWithSkeleton src={authImage.imageUrl} alt="Background" fill className="object-cover blur-xl saturate-150" />}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm">
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
              <CardTitle className="font-headline text-2xl">RESET PASSWORD</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">{email ? `Reset untuk ${email}` : 'Memuat...'}</CardDescription>
              <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Memverifikasi...</p>
              </div>
            )}
            {status === 'form' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Reset Password
                  </Button>
                </form>
              </Form>
            )}
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-primary font-semibold">Berhasil!</p>
                <p className="text-sm text-muted-foreground">Silakan login dengan password baru.</p>
                <Link href="/login"><Button className="w-full mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Login</Button></Link>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-semibold">Gagal</p>
                <p className="text-sm text-muted-foreground">{message}</p>
                <Link href="/login/forgot-password"><Button className="w-full mt-4">Minta Link Baru</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
