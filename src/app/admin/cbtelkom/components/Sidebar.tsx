
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Images, Settings, Shield } from 'lucide-react';

const navItems = [
  { href: '/admin/cbtelkom', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cbtelkom/manage-content', label: 'Konten', icon: FileText },
  { href: '/admin/cbtelkom/manage-images', label: 'Gambar', icon: Images },
  { href: '/admin/cbtelkom/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
      <div className="h-16 border-b flex items-center px-6">
        <Link href="/admin/cbtelkom" className="flex items-center gap-2 font-bold">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-headline">Admin Portal</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
              pathname === item.href && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
