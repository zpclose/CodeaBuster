// Main Firebase config untuk Auth + Firestore (database)
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Separate Firebase config untuk Storage (project berbeda)
export const storageConfig = {
  apiKey: process.env.NEXT_PUBLIC_STORAGE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_STORAGE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_STORAGE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_STORAGE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_STORAGE_APP_ID,
};
