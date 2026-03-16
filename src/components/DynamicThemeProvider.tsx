'use client';

import React, { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { usePathname } from 'next/navigation';

interface DynamicThemeProviderProps {
    children: ReactNode;
}

/**
 * Centrally manages Theme isolation based on the current route.
 * - Routes starting with /admin are forced to dark mode with a separate key.
 * - All other routes use standard behavior.
 */
export function DynamicThemeProvider({ children }: DynamicThemeProviderProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme={isAdmin ? "dark" : "light"}
            storageKey={isAdmin ? "admin-theme" : "theme"}
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}
