import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { limiter } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // Security Headers - Always set these
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Prevent clickjacking
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");

    // 1. Rate Limit for APIs
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const isAllowed = limiter.check(10, ip);
        if (!isAllowed) {
            return new NextResponse(
                JSON.stringify({ error: 'Too Many Requests', message: 'Slow down!' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 2. Block access from suspicious origins
    const suspiciousPatterns = ['javascript:', 'data:', 'vbscript:'];
    for (const pattern of suspiciousPatterns) {
        if (hostname.includes(pattern) || pathname.includes(pattern)) {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }

    // 3. Maintenance Mode Enforcement
    const isAdmin = pathname.startsWith('/admin');
    const isMaintenancePage = pathname === '/maintenance';
    const isApi = pathname.startsWith('/api');

    if (!isAdmin && !isMaintenancePage && !isApi) {
        const maintenanceCookie = request.cookies.get('maintenance-mode');
        if (maintenanceCookie?.value === '1') {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }

    // 4. Protect Admin Routes 
    if (isAdmin) {
        const adminSession = request.cookies.get('admin-session');
        const userSession = request.cookies.get('session');
        
        // If not logged in at all → redirect to /login
        if (!adminSession && !userSession) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        
        // If logged in as regular user but not admin → let through (will show 404)
        // If admin → let through (will show admin page)
    }

    // 5. Protect User Routes - Require Authentication
    const publicRoutes = [
        '/',
        '/about',
        '/network',
        '/register',
        '/login',
        '/login/forgot-password',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/maintenance',
        '/auth/action',
        '/auth/verify',
        '/auth/reset',
    ];
    
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
    );
    
    const publicPathPrefixes = ['/projects', '/programs', '/events', '/sifonix-portfolio', '/icsit-portfolio', '/mlbb-portfolio'];
    const isPublicPathPrefix = publicPathPrefixes.some(prefix => pathname.startsWith(prefix));

    if (!isPublicRoute && !isPublicPathPrefix && !isAdmin) {
        const sessionCookie = request.cookies.get('session');
        if (!sessionCookie) {
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
            redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            redirectResponse.headers.set('Pragma', 'no-cache');
            redirectResponse.headers.set('Expires', '0');
            return redirectResponse;
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|Logo_CBP.png).*)',
    ],
};
