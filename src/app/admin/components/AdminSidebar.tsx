'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Images, FileText, Settings, Shield, Inbox, LogOut, ChevronDown, Users, Trophy, Network, ImageIcon, User, ScrollText, UserCog, ChevronLeft, ChevronRight, Sun, Moon, Palette, Briefcase, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleCustom } from './ThemeToggleCustom';
import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { adminLogout } from '../actions';
import { useTheme } from 'next-themes';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/proposals', label: 'Proposal Proyek', icon: Inbox },
];

const contentSubmenu = [
  { href: '/admin/content/projects', label: 'Projects', icon: Briefcase },
  { href: '/admin/content/team', label: 'Team Members', icon: Users },
  { href: '/admin/content/directives', label: 'Council Directives', icon: ScrollText },
  { href: '/admin/content/achievements', label: 'Achievements', icon: Trophy },
  { href: '/admin/content/partners', label: 'Network Partners', icon: Network },
  { href: '/admin/content/images', label: 'Page Images', icon: ImageIcon },
  { href: '/admin/content/live-events', label: 'Live Campus Events', icon: CalendarDays },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(pathname === '/admin' || pathname.startsWith('/admin/content'));
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const firestore = useFirestore();
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAdminEmail(localStorage.getItem('admin-email') || '');
    setAdminRole(localStorage.getItem('admin-role') || '');
    setAdminName(localStorage.getItem('admin-name') || 'Admin');
  }, []);

  useEffect(() => {
    if (!firestore) return;
    getDoc(doc(firestore, 'page-images', 'site-logo')).then((snap) => {
      if (snap.exists() && snap.data()?.imageUrl) {
        setSiteLogo(snap.data().imageUrl);
      }
    });
  }, [firestore]);

  const handleLogout = async () => {
    await adminLogout();
    localStorage.removeItem('admin-session');
    localStorage.removeItem('admin-email');
    localStorage.removeItem('admin-role');
    localStorage.removeItem('admin-name');
    localStorage.removeItem('admin-theme');
    router.push('/login');
  };

  const isOwner = adminRole === 'owner';

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-background border-none relative z-20 transition-all duration-300 h-full",
      isCollapsed ? "w-24" : "w-72"
    )}>
      {/* Toggle Button on Divider */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 z-50 h-8 w-8 rounded-full border border-border/60 bg-background shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
        title={isCollapsed ? "Kembangkan Sidebar" : "Lipat Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4 ml-0.5" /> : <ChevronLeft className="h-4 w-4 mr-0.5" />}
      </Button>
      <div className={cn("h-24 flex items-center shrink-0", isCollapsed ? "justify-center" : "px-10 justify-between")}>
        {!isCollapsed ? (
          <Link href="/admin" className="flex items-center gap-3 font-bold group truncate">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 transition-all">
              <div className="relative h-6 w-6">
                <Image
                  src={siteLogo || "/favicon.ico"}
                  alt="Codebusters Logo"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
            </div>
            <span className="font-headline text-lg tracking-tight text-foreground truncate">CODEBUSTERS</span>
          </Link>
        ) : (
          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 transition-all">
            <div className="relative h-6 w-6">
              <Image
                src={siteLogo || "/favicon.ico"}
                alt="Codebusters Logo"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 min-h-0 pl-0 pr-0 py-6 space-y-2.5 overflow-y-auto scrollbar-hide overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="relative group">
              {isActive && (
                <>
                  <div className="absolute -top-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                    <div className="absolute inset-0 bg-muted/40" />
                    <div className="absolute inset-0 bg-background rounded-br-[1.5rem]" />
                  </div>
                  <div className="absolute -bottom-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                    <div className="absolute inset-0 bg-muted/40" />
                    <div className="absolute inset-0 bg-background rounded-tr-[1.5rem]" />
                  </div>
                </>
              )}
              <Link
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center py-3.5 text-sm font-medium transition-all duration-300 relative z-20',
                  isActive
                    ? 'bg-muted/40 text-primary font-semibold shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)] border-y border-transparent'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  isCollapsed ? (
                    isActive ? 'ml-3 pl-[1.15rem] rounded-l-full' : 'mx-4 justify-center rounded-xl'
                  ) : (
                    isActive ? 'ml-6 pl-5 rounded-l-full gap-3' : 'mx-6 px-5 rounded-full gap-3'
                  )
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "text-primary" : "")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </div>
          );
        })}

        {/* Content Management Collapsible */}
        <Collapsible
          open={isCollapsed ? false : isContentOpen}
          onOpenChange={isCollapsed ? undefined : setIsContentOpen}
          className="pt-2"
        >
          {isCollapsed ? (
            // Render as a simple button if collapsed
            <div className="relative group flex justify-center mt-2 px-4">
              <Button
                variant="ghost"
                className="h-12 w-full rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                title="Content Management"
                onClick={() => {
                  // If they click this when collapsed, expand sidebar and open this
                  setIsCollapsed(false);
                  setIsContentOpen(true);
                }}
              >
                <FileText className="h-5 w-5 shrink-0" />
              </Button>
            </div>
          ) : (
            <CollapsibleTrigger className={cn(
              'flex items-center justify-between gap-3 py-3.5 text-sm font-medium transition-all duration-300 relative z-20 mx-6 px-5 rounded-full w-[calc(100%-3rem)]',
              pathname.startsWith('/admin/content')
                ? 'text-foreground bg-muted/40 font-semibold'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}>
              <div className="flex items-center gap-3 truncate">
                <FileText className="h-5 w-5 shrink-0" />
                <span className="truncate">Content Management</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isContentOpen && "rotate-180")} />
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="space-y-1.5 mt-2 overflow-hidden">
            {contentSubmenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="relative mt-1 group">
                  {isActive && (
                    <>
                      <div className="absolute -top-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                        <div className="absolute inset-0 bg-muted/40" />
                        <div className="absolute inset-0 bg-background rounded-br-[1.5rem]" />
                      </div>
                      <div className="absolute -bottom-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                        <div className="absolute inset-0 bg-muted/40" />
                        <div className="absolute inset-0 bg-background rounded-tr-[1.5rem]" />
                      </div>
                    </>
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 py-3 text-sm font-medium transition-all duration-300 relative z-20',
                      isActive
                        ? 'ml-10 pl-5 rounded-l-full bg-muted/40 text-primary font-semibold shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)]'
                        : 'ml-10 mr-6 px-5 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <div className={cn("flex items-center justify-center w-6 h-6 shrink-0 rounded-md", isActive ? "bg-background shadow-sm text-primary" : "bg-transparent")}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Owner-only: Manage Admins */}
        <div className="pt-2">
          {isOwner && (
            <div className="relative group mt-2">
              {pathname === '/admin/manage-admins' && (
                <>
                  <div className="absolute -top-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                    <div className="absolute inset-0 bg-muted/40" />
                    <div className="absolute inset-0 bg-background rounded-br-[1.5rem]" />
                  </div>
                  <div className="absolute -bottom-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                    <div className="absolute inset-0 bg-muted/40" />
                    <div className="absolute inset-0 bg-background rounded-tr-[1.5rem]" />
                  </div>
                </>
              )}
              <Link
                href="/admin/manage-admins"
                title={isCollapsed ? "Kelola Admin" : undefined}
                className={cn(
                  'flex items-center py-3.5 text-sm font-medium transition-all duration-300 relative z-20',
                  pathname === '/admin/manage-admins'
                    ? 'bg-muted/40 text-primary font-semibold shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)] border-y border-transparent'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  isCollapsed ? (
                    pathname === '/admin/manage-admins' ? 'ml-3 pl-[1.15rem] rounded-l-full' : 'mx-4 justify-center rounded-xl'
                  ) : (
                    pathname === '/admin/manage-admins' ? 'ml-6 pl-5 rounded-l-full gap-3' : 'mx-6 px-5 rounded-full gap-3'
                  )
                )}
              >
                <UserCog className={cn("h-5 w-5 shrink-0 transition-transform duration-300", pathname === '/admin/manage-admins' ? "text-primary" : "")} />
                {!isCollapsed && <span className="truncate">Kelola Admin</span>}
              </Link>
            </div>
          )}

          <div className="relative group mt-2">
            {pathname === '/admin/settings' && (
              <>
                <div className="absolute -top-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                  <div className="absolute inset-0 bg-muted/40" />
                  <div className="absolute inset-0 bg-background rounded-br-[1.5rem]" />
                </div>
                <div className="absolute -bottom-[1.2rem] right-0 w-6 h-6 bg-transparent pointer-events-none z-10">
                  <div className="absolute inset-0 bg-muted/40" />
                  <div className="absolute inset-0 bg-background rounded-tr-[1.5rem]" />
                </div>
              </>
            )}
            <Link
              href="/admin/settings"
              title={isCollapsed ? "Pengaturan" : undefined}
              className={cn(
                'flex items-center py-3.5 text-sm font-medium transition-all duration-300 relative z-20',
                pathname === '/admin/settings'
                  ? 'bg-muted/40 text-primary font-semibold shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)] border-y border-transparent'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                isCollapsed ? (
                  pathname === '/admin/settings' ? 'ml-3 pl-[1.15rem] rounded-l-full' : 'mx-4 justify-center rounded-xl'
                ) : (
                  pathname === '/admin/settings' ? 'ml-6 pl-5 rounded-l-full gap-3' : 'mx-6 px-5 rounded-full gap-3'
                )
              )}
            >
              <Settings className={cn("h-5 w-5 shrink-0 transition-transform duration-300", pathname === '/admin/settings' ? "text-primary" : "")} />
              {!isCollapsed && <span className="truncate">Pengaturan</span>}
            </Link>
          </div>

        </div>
      </nav>

      <div className={cn("mt-auto pb-6 transition-all duration-300 shrink-0", isCollapsed ? "px-4" : "p-6")}>
        <div className={cn(
          "flex items-center bg-gradient-to-br from-background flex-col to-muted/30 border border-border/60 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden",
          isCollapsed ? "p-2 py-4 justify-center" : "gap-3 p-3.5 flex-row"
        )}>
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate tracking-tight text-foreground">{adminName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminEmail || 'Administrator'}</p>
            </div>
          )}
        </div>

        <div className={cn(
          "relative group mt-4 flex items-center justify-center transition-all duration-300",
          isCollapsed ? "px-0" : "px-0"
        )}>
          <ThemeToggleCustom scale={isCollapsed ? 0.8 : 1.1} />
        </div>

        {isCollapsed ? (
          <Button
            variant="ghost"
            className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl mt-4 h-12"
            onClick={handleLogout}
            title="Keluar Sesi"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl mt-4 h-12 px-4 group/logout"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0 transition-transform group-hover/logout:-translate-x-1" />
            <span className="truncate">Keluar Sesi</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
