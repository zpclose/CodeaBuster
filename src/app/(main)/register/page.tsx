
'use client';
import RegisterForm from './components/RegisterForm';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { CodeConnectLogo } from '@/components/icons';

export default function RegisterPage() {
  useRedirectIfAuthenticated('/');
  const firestore = useFirestore();
  const [siteLogo, setSiteLogo] = useState<string | null | undefined>(undefined);
  const [logoLoading, setLogoLoading] = useState(true);

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

  return (
    <div className="bg-background text-foreground">
      <div className="container min-h-[80vh] py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {siteLogo !== undefined && (
              siteLogo ? (
                <div className="relative h-16 w-16 mx-auto mb-6">
                  <ImageWithSkeleton src={siteLogo} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <CodeConnectLogo isLoading={logoLoading} className="mx-auto h-16 w-16 text-primary mb-6" />
              )
            )}
            {siteLogo === undefined && (
              <CodeConnectLogo isLoading={true} className="mx-auto h-16 w-16 text-primary mb-6" />
            )}
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your Ascent to The <span className="text-primary">Elite Circle</span>.
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Aplikasi ini adalah langkah awal Anda menuju jaringan talenta digital terkemuka dari Telkom University dan Universitas Mercu Buana. Kualitas dan Komitmen adalah kunci.
            </p>
          </div>
{/* 
          <div className="bg-card p-8 rounded-lg border shadow-lg mb-12">
            <h2 className="font-headline text-2xl font-bold">The Mandate for Entry</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground list-disc list-inside">
              <li>
                <span className="font-semibold text-foreground">Selektivitas:</span> Codebusters adalah komunitas terpilih. Aplikasi akan ditinjau secara ketat oleh Tim Kurasi yang terdiri dari perwakilan TU & UMB.
              </li>
              <li>
                <span className="font-semibold text-foreground">Syarat Dasar:</span> Mahasiswa aktif Telkom University atau Universitas Mercu Buana, memiliki dasar skill coding (minimal Intermediate), dan komitmen untuk berpartisipasi aktif.
              </li>
               <li>
                <span className="font-semibold text-foreground">Timeline:</span> Hasil seleksi akan diumumkan melalui email dalam waktu 2-3 minggu setelah periode pendaftaran ditutup.
              </li>
            </ul>
          </div> */}
          
          <RegisterForm />

        </div>
      </div>
    </div>
  );
}
