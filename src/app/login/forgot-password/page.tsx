'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { sendPasswordResetEmail } from '@/firebase/auth/auth';
import { getDoc, doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CodeConnectLogo } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
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
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    if (!auth) {
      toast({
        title: "Error",
        description: "Layanan otentikasi tidak tersedia.",
        variant: "destructive"
      })
      setIsLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsEmailSent(true);
      toast({
        title: 'Email Terkirim!',
        description: 'Silakan cek email Anda untuk reset password. Jangan lupa cek folder Spam.',
      });
    } catch(error: any) {
      let errorMessage = "Terjadi kesalahan.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak terdaftar.';
      }
      toast({
        title: "Gagal Mengirim Email",
        description: errorMessage,
        variant: "destructive"
      })
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
                    <Image src={siteLogo} alt="Logo" fill className="object-contain" />
                  </div>
                ) : (
                  <CodeConnectLogo isLoading={logoLoading} className="mx-auto h-12 w-12 text-primary" />
                )
              )}
              {siteLogo === undefined && (
                <CodeConnectLogo isLoading={true} className="mx-auto h-12 w-12 text-primary" />
              )}
              <div>
                <CardTitle className="font-headline text-2xl tracking-wider">
                  RESET PASSWORD
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Masukkan email Anda untuk menerima tautan reset password
                </CardDescription>
                <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kami telah mengirim tautan reset password ke email Anda.
                  </p>
                  <Button onClick={() => router.push('/login')} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                </div>
              ) : (
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
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="user@example.com" 
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full shadow-md text-lg py-6 font-bold" 
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Kirim Tautan Reset'}
                    </Button>
                  </form>
                </Form>
              )}
              <div className="mt-6 text-center text-sm">
                <Link href="/login" className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
