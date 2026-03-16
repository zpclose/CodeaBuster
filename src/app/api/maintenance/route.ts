import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    // Verify admin session cookie — only admin can toggle maintenance mode
    const adminSession = request.cookies.get('admin-session');
    if (!adminSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { maintenanceMode: boolean };
    const { maintenanceMode } = body;

    const response = NextResponse.json({ success: true, maintenanceMode });

    if (maintenanceMode) {
        // Set maintenance cookie (30 days, httpOnly so middleware can read it)
        response.cookies.set('maintenance-mode', '1', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
            sameSite: 'strict',
        });
    } else {
        // Remove the cookie (turn off maintenance)
        response.cookies.set('maintenance-mode', '', {
            httpOnly: true,
            maxAge: 0,
            path: '/',
        });
    }

    return response;
}
