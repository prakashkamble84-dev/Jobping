import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, CareerProfile } from '../types';
import { initFirebase, isFirebaseConfigured } from './firebaseConfig';

const LOCAL_USERS_KEY = 'jobready_ai_users_v1';
const LOCAL_SESSION_KEY = 'jobready_ai_session_v1';
const DEMO_USER_ID = 'demo-rahul-sharma-101';

interface StoredLocalUser {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

// Simple browser SHA-256 hash to avoid storing plain-text passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_jobready_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getLocalUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredLocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Subscribe listeners
type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: User | null) {
  listeners.forEach((listener) => listener(user));
}

export function subscribeToAuth(callback: AuthListener): () => void {
  listeners.add(callback);

  const { auth, db } = initFirebase();
  if (auth) {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        let name = fbUser.displayName || 'JobReady Member';
        // Attempt to fetch name from Firestore
        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (userSnap.exists()) {
              name = userSnap.data().name || name;
            }
          } catch (e) {
            console.warn('Could not fetch user record from Firestore:', e);
          }
        }
        const currentUser: User = {
          uid: fbUser.uid,
          name,
          email: fbUser.email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        callback(currentUser);
      } else {
        callback(null);
      }
    });

    return () => {
      listeners.delete(callback);
      unsubscribe();
    };
  }

  // Local mode: check current session
  const current = getCurrentUser();
  callback(current);

  return () => {
    listeners.delete(callback);
  };
}

export function getCurrentUser(): User | null {
  const { auth } = initFirebase();
  if (auth && auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      name: auth.currentUser.displayName || 'JobReady Member',
      email: auth.currentUser.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Local fallback
  const sessionUid = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!sessionUid) return null;
  const users = getLocalUsers();
  const found = users.find((u) => u.uid === sessionUid);
  if (!found) return null;

  return {
    uid: found.uid,
    name: found.name,
    email: found.email,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
  };
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) throw new Error('Please enter your full name.');
  if (!trimmedEmail || !trimmedEmail.includes('@')) throw new Error('Please enter a valid email address.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');

  const { auth, db } = initFirebase();

  if (auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const uid = cred.user.uid;
      const now = new Date().toISOString();
      const newUser: User = {
        uid,
        name: trimmedName,
        email: trimmedEmail,
        createdAt: now,
        updatedAt: now,
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', uid), newUser);
        } catch (dbErr) {
          console.error('Error saving user profile to Firestore:', dbErr);
        }
      }

      notifyListeners(newUser);
      return newUser;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('The email address provided is not valid.');
      }
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  }

  // Local Authenticated Storage Mode
  const users = getLocalUsers();
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    throw new Error('An account with this email address already exists. Please login instead.');
  }

  const uid = 'usr_' + crypto.randomUUID().slice(0, 12);
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newUser: StoredLocalUser = {
    uid,
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  saveLocalUsers(users);
  localStorage.setItem(LOCAL_SESSION_KEY, uid);

  const cleanUser: User = {
    uid,
    name: trimmedName,
    email: trimmedEmail,
    createdAt: now,
    updatedAt: now,
  };

  notifyListeners(cleanUser);
  return cleanUser;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) throw new Error('Please enter your email address.');
  if (!password) throw new Error('Please enter your password.');

  const { auth, db } = initFirebase();

  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      let name = cred.user.displayName || 'JobReady Member';
      if (db) {
        try {
          const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
          if (userSnap.exists()) {
            name = userSnap.data().name || name;
          }
        } catch (e) {
          console.warn('Could not read user profile from Firestore:', e);
        }
      }

      const user: User = {
        uid: cred.user.uid,
        name,
        email: cred.user.email || trimmedEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notifyListeners(user);
      return user;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        throw new Error('Incorrect email or password. Please check your credentials and try again.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  // Local Mode
  const users = getLocalUsers();
  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    throw new Error('No account found with this email. Please sign up first.');
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash && !user.isDemo) {
    throw new Error('Incorrect password. Please try again or reset your password.');
  }

  localStorage.setItem(LOCAL_SESSION_KEY, user.uid);
  const cleanUser: User = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  notifyListeners(cleanUser);
  return cleanUser;
}

export async function sendResetPassword(email: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const { auth } = initFirebase();
  if (auth) {
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account registered with this email address.');
      }
      throw new Error(error.message || 'Could not send password reset email.');
    }
  }

  // Local fallback: verify email exists
  const users = getLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!found) {
    throw new Error('No registered account was found with this email address.');
  }
}

export async function logoutUser(): Promise<void> {
  const { auth } = initFirebase();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
  }

  localStorage.removeItem(LOCAL_SESSION_KEY);
  notifyListeners(null);
}

export const onAuthStateChange = subscribeToAuth;

/**
 * Loads the Sample Demo Account ("Rahul Sharma") specified in Section 20 of prompt.
 * Clearly labeled as development / demo data.
 */
export async function loadDemoAccount(): Promise<{ user: User; profile: CareerProfile; isDemo: true }> {
  const demoEmail = 'rahul.sharma.demo@jobready.ai';
  const users = getLocalUsers();
  let demo = users.find((u) => u.uid === DEMO_USER_ID);

  if (!demo) {
    const now = new Date().toISOString();
    demo = {
      uid: DEMO_USER_ID,
      name: 'Rahul Sharma',
      email: demoEmail,
      passwordHash: await hashPassword('demo12345'),
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    users.push(demo);
    saveLocalUsers(users);
  }

  localStorage.setItem(LOCAL_SESSION_KEY, DEMO_USER_ID);

  const cleanUser: User = {
    uid: demo.uid,
    name: demo.name,
    email: demo.email,
    createdAt: demo.createdAt,
    updatedAt: demo.updatedAt,
  };

  const { getDefaultDemoProfile, saveCareerProfile } = await import('./profileService');
  const demoProfile = getDefaultDemoProfile();
  await saveCareerProfile(cleanUser.uid, demoProfile);

  notifyListeners(cleanUser);
  return { user: cleanUser, profile: demoProfile, isDemo: true };
}
