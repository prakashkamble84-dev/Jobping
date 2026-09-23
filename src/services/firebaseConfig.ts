import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let cachedFirebaseApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;
let configSource: 'env' | 'applet-file' | 'unconfigured' = 'unconfigured';

export function getFirebaseConfig(): FirebaseClientConfig | null {
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envKey && envProjectId) {
    configSource = 'env';
    return {
      apiKey: envKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
    };
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function getFirebaseSource(): 'env' | 'applet-file' | 'unconfigured' {
  getFirebaseConfig();
  return configSource;
}

export function initFirebase(): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  if (cachedFirebaseApp && cachedAuth && cachedFirestore) {
    return { app: cachedFirebaseApp, auth: cachedAuth, db: cachedFirestore };
  }

  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    return { app: null, auth: null, db: null };
  }

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    const auth = getAuth(app);
    const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);

    cachedFirebaseApp = app;
    cachedAuth = auth;
    cachedFirestore = db;
    return { app, auth, db };
  } catch (err) {
    console.warn('Could not initialize Firebase client SDK:', err);
    return { app: null, auth: null, db: null };
  }
}
