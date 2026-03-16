'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AdminSidebar } from './components/AdminSidebar';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminFirebaseClientProvider } from '@/firebase/admin-client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';

function AdminContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const session = localStorage.getItem('admin-session');
    if (session !== 'true') {
      notFound();
    } else {
      setIsAuthenticated(true);
    }
  }, [mounted]);

  if (!isDesktop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <Loader2 className="h-12 w-12 text-destructive animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Desktop Only Access</h1>
        <p className="text-muted-foreground max-w-md">
          Portal admin hanya dapat diakses melalui perangkat Desktop atau Laptop. Silakan buka kembali halaman ini menggunakan layar yang lebih besar.
        </p>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background overflow-hidden relative">
      <div className="shrink-0 h-full">
        <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      </div>

      <main className="flex-1 min-w-0 bg-muted/40 dark:bg-muted/10 p-4 lg:p-6 relative overflow-hidden h-full md:rounded-tl-[2.5rem] shadow-[-10px_0px_40px_rgba(0,0,0,0.04)] dark:shadow-[-5px_0px_30px_rgba(0,0,0,0.1)] transition-all duration-300 border-l border-t border-border/40">
        {/* Subtle dot matrix background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-40 pointer-events-none md:rounded-tl-[2.5rem]" />

        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none transition-all duration-300" />

        <div className="relative z-10 max-w-7xl mx-auto h-full overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
