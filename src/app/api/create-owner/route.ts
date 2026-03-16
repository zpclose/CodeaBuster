import { NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import bcrypt from 'bcryptjs';

export async function POST() {
    try {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig!) : getApps()[0];
        const firestore = getFirestore(app);

        const email = 'growidbapak@gmail.com';
        const password = 'owners';
        const passwordHash = await bcrypt.hash(password, 10);

        await setDoc(doc(firestore, 'admin-users', email), {
            email,
            passwordHash,
            role: 'owner',
            displayName: 'Owner',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true, message: 'Owner created with password: owners' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, message: 'Error: ' + String(error) }, { status: 500 });
    }
}
