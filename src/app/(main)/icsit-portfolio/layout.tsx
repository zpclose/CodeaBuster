import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function IcsitPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

  return (
    <div className="bg-background text-foreground antialiased font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm support-backdrop-blur:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {mercuBuanaLogo && (
              <Image
                src={mercuBuanaLogo.imageUrl}
                alt="Universitas Mercu Buana"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            )}
            <span className="text-xl font-bold text-foreground">
              CODEBUSTERS MERCU BUANA
            </span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/achievements">Kembali ke Galeri</Link>
          </Button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Codebusters Mercu Buana.
          </p>
        </div>
      </footer>
    </div>
  );
}
