
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signIn } from '@/firebase/auth/auth';
import { doc, getDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CodeConnectLogo } from '@/components/icons';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { checkAndSetAdminSession, adminLogin } from './actions';


const formSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  useRedirectIfAuthenticated('/');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null | undefined>(undefined);
  const [logoLoading, setLogoLoading] = useState(true);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const authImage = PlaceHolderImages.find(p => p.id === 'auth-visual');

  useEffect(() => {
    if (!firestore) return;
    getDoc(doc(firestore, 'page-images', 'site-logo')).then((snap) => {
      setLogoLoading(false);
      if (snap.exists() && snap.data()?.imageUrl) {
        setSiteLogo(snap.data().imageUrl);
      } else {
        setSiteLogo(null);
      }
    });
  }, [firestore]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
  }, [mounted, router]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);

    try {
      const result = await adminLogin(formData);

      if (result.success && result.admin) {
        toast({
          title: "Login Admin Berhasil",
          description: `Selamat datang, ${result.admin.displayName}.`,
        });
        localStorage.setItem('admin-session', 'true');
        localStorage.setItem('admin-email', result.admin.email);
        localStorage.setItem('admin-role', result.admin.role);
        localStorage.setItem('admin-name', result.admin.displayName);
        setIsAdminLoggedIn(true);
        setIsLoading(false);
        router.push('/admin');
        return;
      }

      if (!auth) {
        toast({
          title: "Error",
          description: "Layanan otentikasi tidak tersedia.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const userCredential = await signIn(auth, values.email, values.password);
      await userCredential.user.reload();
      const user = auth.currentUser;

      if (!user || !user.emailVerified) {
        toast({
          title: "Email Belum Diverifikasi",
          description: "Silakan cek email Anda untuk verifikasi akun.",
          variant: "destructive"
        });
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      let displayName = user.email?.split('@')[0];
      if (firestore && user.uid) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            displayName = userData.fullName || displayName;
          }
        } catch (err) {
          console.warn('Failed to get user data:', err);
        }
      }

      toast({
        title: 'Login Berhasil!',
        description: `Selamat datang, ${displayName}!`,
      });

      document.cookie = 'session=true; path=/; max-age=2592000; SameSite=Lax';
      router.push('/');
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan saat login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau kata sandi salah.';
      }
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      {authImage && (
        <Image
          src={authImage.imageUrl}
          alt="Abstract background"
          fill
          className="object-cover blur-xl saturate-150"
          data-ai-hint="abstract technology"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pt-8">
            {siteLogo !== undefined && (
              siteLogo ? (
                <div className="relative h-16 w-16 mx-auto">
                  <Image
                    src={siteLogo}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <CodeConnectLogo isLoading={logoLoading} className="mx-auto h-16 w-16 text-primary" />
              )
            )}
            {siteLogo === undefined && (
              <CodeConnectLogo isLoading={true} className="mx-auto h-16 w-16 text-primary" />
            )}
            <div>
              <CardTitle className="font-headline text-2xl tracking-wider">
                AUTHENTICATION PROTOCOL
              </CardTitle>
              <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="user@example.com" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Kata Sandi</FormLabel>
                        <Link href="/login/forgot-password" className="ml-auto inline-block text-xs text-muted-foreground hover:text-primary">
                          Lupa Kata Sandi?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full shadow-md text-lg py-6 font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Masuk'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Belum punya akun? </span>
              <Link href="/register" className="font-semibold text-primary hover:underline">Daftar</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
