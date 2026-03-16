'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CodeConnectLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, User, ChevronDown, Loader2, Settings, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signout } from '@/firebase/auth/auth';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/NotificationBell';
import SafeImage from '@/components/ui/safe-image';

const mainNavLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/about', label: 'Tentang Kami' },
  { href: '/network', label: 'Jaringan' },
];

const loggedInNavLinks = [
  { href: '/programs', label: 'Program' },
  { href: '/achievements', label: 'Pencapaian' },
]

const communityNavLinks = [
  { href: '/management', label: 'Pengurus' },
  { href: '/projects', label: 'Proyek' },
  { href: '/idea-generator', label: 'Ide Proyek (AI)' },
  { href: '/submit-proposal', label: 'Ajukan Proyek' },
];

function CommunityDropdown() {
  const pathname = usePathname();
  const isActive = communityNavLinks.some(link => pathname.startsWith(link.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn(
          'text-sm font-medium text-muted-foreground hover:text-primary',
          isActive && 'text-primary'
        )}>
          Komunitas <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {communityNavLinks.map(link => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PartnersDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Mitra Kami <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <a href="https://telkomuniversity.ac.id/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/0/03/Logo_Telkom_University_potrait.png" alt="Telkom University Logo" width={24} height={24} className="object-contain" />
            <span>Telkom University</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="https://www.mercubuana.ac.id/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <Image src="https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/LOGO_UNIVERSITAS_MERCU_BUANA.png?alt=media&token=f7d3fdf6-26a4-46cb-9dce-f3bb83d131dd" alt="Universitas Mercu Buana Logo" width={24} height={24} className="object-contain" />
            <span>Universitas Mercu Buana</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

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

  const isVerified = user?.emailVerified || user?.email === 'juri.demo@codeabuster.com';

  const userDocRef = useMemoFirebase(() =>
    user && firestore ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]);

  const { data: userProfile, isLoading: profileLoading } = useDoc(userDocRef);
  const loading = isUserLoading || profileLoading;

  if (!mounted) return null;
  if (pathname.startsWith('/admin')) return null;

  const handleSignOut = async () => {
    if (auth) {
      await signout(auth);
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/');
    }
  };

  const displayName = userProfile?.fullName || user?.displayName || 'User';
  const avatarUrl = userProfile?.avatarUrl || user?.photoURL || `https://avatar.vercel.sh/${user?.uid || 'default'}.png`;

  const renderNavLinks = (isMobile = false) => (
    <>
      {mainNavLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          asChild
          className={cn(
            'text-sm font-medium transition-colors',
            pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-primary',
            isMobile && 'w-full justify-start h-12'
          )}
        >
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}

      {user && isVerified && (
        <>
          {loggedInNavLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                'text-sm font-medium transition-colors',
                pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                isMobile && 'w-full justify-start h-12'
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          {isMobile ? (
            <div className="mt-4 pt-4 border-t">
              <h4 className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Komunitas</h4>
              {communityNavLinks.map(link => (
                <Button key={link.href} variant="ghost" asChild className={cn('w-full justify-start h-12 text-sm font-medium', pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          ) : (
            <CommunityDropdown />
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            {logoLoading ? (
              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
            ) : siteLogo ? (
              <div className="relative h-8 w-8 transition-transform group-hover:scale-110">
                <SafeImage
                  src={siteLogo}
                  alt="Logo"
                  fill
                  className="object-contain"
                  fallback="/placeholder-image.jpg"
                />
              </div>
            ) : (
              <CodeConnectLogo isLoading={logoLoading} className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            )}
            <span className="font-poppins text-xl font-bold text-foreground">
              Tel-Nect
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <nav className="hidden items-center gap-1 md:flex">
            {renderNavLinks()}
            {user && isVerified && <PartnersDropdown />}
          </nav>

          <div className="hidden md:block">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (user && isVerified) ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 bg-muted/30 border-b">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm">Memuat profil...</p>
                      </div>
                    ) : (user && isVerified) ? (
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage src={avatarUrl} alt={displayName} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-bold text-base truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Selamat datang di Tel-Nect</p>
                        <Button asChild className="w-full">
                          <Link href="/login">Masuk ke Akun</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto py-4">
                    <nav className="flex flex-col gap-1 px-2">
                      {renderNavLinks(true)}

                      {user && isVerified && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mitra Strategis</h4>
                          <a href="https://telkomuniversity.ac.id/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                              <Image src="https://upload.wikimedia.org/wikipedia/commons/0/03/Logo_Telkom_University_potrait.png" alt="TU" width={24} height={24} className="object-contain" />
                              <span>Telkom University</span>
                            </div>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                          <a href="https://www.mercubuana.ac.id/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                              <Image src="https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/LOGO_UNIVERSITAS_MERCU_BUANA.png?alt=media&token=f7d3fdf6-26a4-46cb-9dce-f3bb83d131dd" alt="UMB" width={24} height={24} className="object-contain" />
                              <span>Mercu Buana</span>
                            </div>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        </div>
                      )}
                    </nav>
                  </div>

                  {user && isVerified && (
                    <div className="p-4 border-t bg-muted/10 space-y-2">
                      <Button variant="outline" asChild className="w-full justify-start h-11">
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" /> Profil Saya
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full justify-start h-11">
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" /> Pengaturan
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" /> Keluar
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
