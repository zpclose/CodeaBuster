import { NextResponse } from 'next/server';
import { resetOwnerPassword } from '@/lib/admin-utils';

export async function POST() {
    try {
        const result = await resetOwnerPassword();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error resetting owner password:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal reset password' },
            { status: 500 }
        );
    }
}
