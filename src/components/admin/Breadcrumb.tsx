'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

export function Breadcrumb() {
    const pathname = usePathname();

    // Generate breadcrumb items from pathname
    const pathSegments = pathname.split('/').filter(Boolean);

    const breadcrumbItems = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return { href, label };
    });

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/admin" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>Admin</span>
            </Link>

            {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                    <Fragment key={item.href}>
                        <ChevronRight className="h-3.5 w-3.5" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
