
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: 'Profil Publik',
    href: '/settings',
  },
  {
    title: 'Akun & Keamanan',
    href: '/settings/account',
  },
  {
    title: 'Tampilan & Preferensi',
    href: '/settings/appearance',
  },
  {
    title: 'Notifikasi',
    href: '/settings/notifications',
  },
  {
    title: 'Kemitraan & Akses',
    href: '/settings/integrations',
  },
  {
    title: 'Riwayat Aktivitas',
    href: '/settings/history'
  }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container max-w-6xl mx-auto py-12 md:py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Pengaturan Akun</h1>
        <p className="text-muted-foreground">
          Kelola akun, profil publik, dan preferensi aplikasi Anda.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-transparent hover:bg-accent hover:text-accent-foreground',
                  'justify-start'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
