'use client';

import { firebaseConfig, storageConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { setLogLevel, LogLevel } from '@firebase/logger';

setLogLevel(LogLevel.ERROR);

/**
 * Initializes the ADMIN Firebase app (Separate Auth/Firestore project, or same config but different name for isolated auth).
 */
export function initializeAdminFirebase() {
  if (!firebaseConfig) {
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }

  let firebaseApp: FirebaseApp;
  const existingAdmin = getApps().find(app => app.name === 'admin');
  if (existingAdmin) {
    firebaseApp = existingAdmin;
  } else {
    firebaseApp = initializeApp(firebaseConfig, 'admin');
  }

  return getSdks(firebaseApp);
}

/**
 * Initializes the MAIN Firebase app (Firestore/Auth project).
 * Always uses the explicit firebaseConfig — never relies on initializeApp()
 * without arguments, which can accidentally pick up the wrong project.
 */
export function initializeFirebase() {
  if (!firebaseConfig) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase not configured - services will not be available');
    }
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }

  let firebaseApp: FirebaseApp;

  // Check if the default app already exists to avoid duplicate-app errors
  const existingDefault = getApps().find(app => app.name === '[DEFAULT]');
  if (existingDefault) {
    firebaseApp = existingDefault;
  } else {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

let _firestoreInstance: Firestore | null = null;
let _currentAppName: string | null = null;

export function getSdks(firebaseApp: FirebaseApp) {
  // Initialize storage app separately for the storage project
  let storageApp = null;

  if (storageConfig && !getApps().some(app => app.name === 'storage')) {
    storageApp = initializeApp(storageConfig, 'storage');
  } else if (storageConfig) {
    storageApp = getApp('storage');
  }

  const storage = storageApp ? getStorage(storageApp) : null;

  // Reuse existing Firestore instance if already initialized with persistence for this app
  if (_firestoreInstance && _currentAppName === firebaseApp.name) {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: _firestoreInstance,
      storage
    };
  }

  // Reset instance if switching apps
  _firestoreInstance = null;
  _currentAppName = firebaseApp.name;

  let firestore: Firestore;
  
  try {
    // Try to enable persistence BEFORE any other calls
    firestore = initializeFirestore(firebaseApp, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });

    // Enable persistence in background
    enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('[Firestore] Persistence failed - multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('[Firestore] Persistence not available in this browser');
      }
    });
  } catch (err: any) {
    // If persistence already enabled, just use regular getFirestore
    if (err.message?.includes('already been started')) {
      console.warn('[Firestore] Using existing instance (persistence already enabled)');
      firestore = getFirestore(firebaseApp);
    } else {
      throw err;
    }
  }

  _firestoreInstance = firestore;

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
    storage
  };
}

// Export storage app instance untuk direct access
let _storageAppCache: FirebaseApp | null = null;
export function getStorageApp(): FirebaseApp | null {
  if (!storageConfig) return null;

  if (!_storageAppCache) {
    if (!getApps().some(app => app.name === 'storage')) {
      _storageAppCache = initializeApp(storageConfig, 'storage');
    } else {
      _storageAppCache = getApp('storage');
    }
  }
  return _storageAppCache;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
