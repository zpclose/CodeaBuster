'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeAuthSync } from '@/components/ThemeAuthSync';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isPortfolioPage = pathname === '/hok-portfolio' 
        || pathname === '/mlbb-portfolio' 
        || pathname === '/sifonix-portfolio' 
        || pathname === '/icsit-portfolio'
        || pathname.startsWith('/achievements/');
    const hideHeaderFooter = isPortfolioPage;

    return (
        <div className="flex min-h-screen flex-col">
            <ThemeAuthSync />
            {!hideHeaderFooter && <Header />}
            <main className="flex-1">{children}</main>
            {!hideHeaderFooter && <Footer />}
        </div>
    );
}
