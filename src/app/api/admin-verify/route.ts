import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin-session');
        const adminEmail = cookieStore.get('admin-email');

        if (!adminSession || !adminEmail || adminSession.value !== 'true') {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        // Verify email exists in admin collection
        const isValidAdmin = await verifyAdminSession(adminEmail.value);

        if (!isValidAdmin) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        return NextResponse.json({ 
            valid: true, 
            email: adminEmail.value,
            role: cookieStore.get('admin-role')?.value,
            name: cookieStore.get('admin-name')?.value
        });
    } catch (error) {
        console.error('[ADMIN-VERIFY] Error:', error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
