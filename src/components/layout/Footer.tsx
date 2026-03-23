'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CodeConnectLogo } from '@/components/icons';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import SafeImage from '@/components/ui/safe-image';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';

export default function Footer() {
  const { user } = useUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!firestore) return;
    getDoc(doc(firestore, 'page-images', 'site-logo')).then((snap) => {
      setLogoLoading(false);
      if (snap.exists() && snap.data()?.imageUrl) {
        setSiteLogo(snap.data().imageUrl);
      }
    });
  }, [firestore]);

  if (!mounted) return null;
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              {logoLoading ? (
                <CodeConnectLogo isLoading={true} className="h-10 w-10 text-primary" />
              ) : siteLogo ? (
                <div className="relative h-10 w-10">
                  <ImageWithSkeleton
                    src={siteLogo}
                    alt="Logo"
                    fill
                    className="object-contain"
                    fallback="/placeholder-image.jpg"
                    skeletonClassName="rounded-md"
                  />
                </div>
              ) : (
                <CodeConnectLogo className="h-8 w-8 text-primary" />
              )}
              <span className="font-poppins text-2xl font-bold">Tel-Nect</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tempat para pemrogram berkumpul untuk berbagi pengetahuan,
              mengembangkan kemampuan, dan menciptakan berbagai solusi teknologi melalui kolaborasi
              dan semangat inovasi yang terus berkembang.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
              <Link href="#" aria-label="GitHub">
                <Github className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-headline font-semibold">Navigasi</h4>
            <ul className="space-y-1">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary">Beranda</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">Tentang Kami</Link></li>
              {user && (
                <>
                  <li><Link href="/programs" className="text-sm text-muted-foreground hover:text-primary">Program</Link></li>
                  <li><Link href="/projects" className="text-sm text-muted-foreground hover:text-primary">Proyek</Link></li>
                  <li><Link href="/achievements" className="text-sm text-muted-foreground hover:text-primary">Pencapaian</Link></li>
                </>
              )}
            </ul>
          </div>

          {user && (
            <div className="space-y-2">
              <h4 className="font-headline font-semibold">Sumber Daya</h4>
              <ul className="space-y-1">
                <li><Link href="/management" className="text-sm text-muted-foreground hover:text-primary">Pengurus</Link></li>
                <li><Link href="/idea-generator" className="text-sm text-muted-foreground hover:text-primary">AI Idea Generator</Link></li>
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary">Gabung</Link></li>
                <li><Link href="/submit-proposal" className="text-sm text-muted-foreground hover:text-primary">Ajukan Proyek</Link></li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tel-Nect. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
