
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CodeConnectLogo } from '@/components/icons';

export function AuthVisual() {
  const authImage = PlaceHolderImages.find(p => p.id === 'auth-visual');
  const telkomLogo = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait');
  const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex border-r border-border">
      <div className="absolute inset-0 bg-primary" />
      {authImage && (
        <ImageWithSkeleton
          src={authImage.imageUrl}
          alt={authImage.description}
          fill
          className="object-cover opacity-20"
          data-ai-hint={authImage.imageHint}
        />
      )}
      <div className="relative z-20 flex items-center text-lg font-medium">
        <CodeConnectLogo className="h-8 w-8 mr-2" />
        <span className="font-headline text-2xl font-bold">Tel-Nect</span>
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="font-serif text-2xl italic">
            "Your Gateway to Digital Excellence."
          </p>
          <footer className="text-sm flex items-center gap-4 pt-4">
            {telkomLogo && <ImageWithSkeleton src={telkomLogo.imageUrl} alt="Telkom University" width={40} height={40} className="h-10 object-contain" />}
            <div className="h-8 w-px bg-white/50"></div>
            {mercuBuanaLogo && <ImageWithSkeleton src={mercuBuanaLogo.imageUrl} alt="Universitas Mercu Buana" width={40} height={40} className="h-10 object-contain" />}
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
