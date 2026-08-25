import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.apiKey !== 'your_api_key_here'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (typeof window !== 'undefined' || isFirebaseConfigured) {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

/**
 * Sign in using Google OAuth Popup with Firebase Auth
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please add your credentials in .env.local.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { app, db, auth, googleProvider };
export type { FirebaseUser };
