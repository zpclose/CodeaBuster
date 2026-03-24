import { NextRequest, NextResponse } from 'next/server';
import { firestore } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const isDev = process.env.NODE_ENV === 'development';

const firebaseConfig = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || 'studio-8681629558-68f05',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc@studio-8681629558-68f05.iam.gserviceaccount.com',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

function getAdminFirestore() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(firebaseConfig as any),
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Admin:', e);
      return null;
    }
  }
  return firestore();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    if (ids.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ images: [] });
    }

    const images: { id: string; url: string; timestamp: number }[] = [];

    const snapshot = await db.collection('images')
      .where(firestore.FieldPath.documentId(), 'in', ids)
      .get();

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      images.push({
        id: doc.id,
        url: data.imageUrl || '',
        timestamp: Date.now(),
      });
    });

    return NextResponse.json({ images });
  } catch (error) {
    if (isDev) console.error('Error preloading images:', error);
    return NextResponse.json({ images: [] });
  }
}
