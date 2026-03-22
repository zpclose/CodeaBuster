
import Link from 'next/link';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MlbbPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

  return (
    <div className="bg-background text-foreground antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             {mercuBuanaLogo && (
               <ImageWithSkeleton 
                 src={mercuBuanaLogo.imageUrl} 
                 alt="Universitas Mercu Buana" 
                 width={32} 
                 height={32} 
                 className="h-8 w-8 object-contain"
               />
             )}
            <span className="text-sm font-bold tracking-[0.4em] uppercase font-headline">
              E-Sports <span className="text-primary">CBM</span>
            </span>
          </Link>
           <Button variant="ghost" size="sm" asChild className="text-xs font-bold uppercase tracking-widest hover:text-primary">
              <Link href="/achievements">Back to Gallery</Link>
            </Button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t py-20">
        <div className="container text-center space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">
                Official E-Sports Codebusters
            </p>
            <p className="text-xs text-muted-foreground/60">
                &copy; {new Date().getFullYear()} Codebusters Mercu Buana. All Rights Reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
