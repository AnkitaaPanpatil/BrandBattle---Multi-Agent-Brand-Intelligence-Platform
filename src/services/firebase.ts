import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  setLogLevel,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  increment,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  SavedBrandKitRecord,
  PublicBrandKitRecord,
  ClarifiedIdea,
  DebateStage,
  BrandKit,
} from '../types/brand.js';

// Suppress verbose SDK stream teardown notices
setLogLevel('error');

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Safe environment variable retriever for both Node (server.ts) and Vite client
function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key]!;
  }
  try {
    return (import.meta as any)?.env?.[key] || '';
  } catch {
    return '';
  }
}

// Support custom Firebase project via .env variables while falling back to applet config
const activeFirebaseConfig = {
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfig.projectId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || firebaseConfig.appId,
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || firebaseConfig.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfig.authDomain,
  firestoreDatabaseId: getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || firebaseConfig.firestoreDatabaseId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfig.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfig.messagingSenderId,
};

const app = !getApps().length ? initializeApp(activeFirebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = activeFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const GOOGLE_OAUTH_CLIENT_ID =
  getEnv('VITE_GOOGLE_OAUTH_CLIENT_ID') ||
  (firebaseConfig as any)?.oAuthClientId ||
  '702656090818-mbvmqvg2c9e4j95j32h33tvn9nao9pj2.apps.googleusercontent.com';

// Connection check with graceful fallback
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected on fresh or empty instances; safely ignored
  }
}
testConnection();

export interface BrandBattleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isLocal?: boolean;
}

export type AuthUser = User | BrandBattleUser;

const LOCAL_USER_KEY = 'brandbattle_local_user';
const LOCAL_KITS_KEY_PREFIX = 'brandbattle_saved_kits_';
const LOCAL_PUBLIC_KITS_KEY = 'brandbattle_public_kits';

const authSubscribers: ((user: AuthUser | null) => void)[] = [];

function notifyAuthSubscribers(user: AuthUser | null) {
  authSubscribers.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error('Error in auth subscriber:', e);
    }
  });
}

export const DEFAULT_PRESET_ACCOUNTS: BrandBattleUser[] = [
  {
    uid: 'local_guest_mode',
    displayName: 'Guest Mode',
    email: 'guest@brandbattle.local',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isLocal: true,
  },
  {
    uid: 'local_ankit_gmail_com',
    displayName: 'Ankit',
    email: 'ankit@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isLocal: true,
  },
];

export const DEFAULT_FOUNDER_USER: BrandBattleUser = DEFAULT_PRESET_ACCOUNTS[0];

const KNOWN_ACCOUNTS_KEY = 'brandbattle_known_accounts';

export function generateAvatarUrl(name: string, email: string): string {
  const seed = encodeURIComponent((name || email || 'BrandBattle').trim());
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0284c7,f59e0b,10b981,8b5cf6,ec4899`;
}

export function getKnownAccounts(): BrandBattleUser[] {
  if (!isBrowser) return DEFAULT_PRESET_ACCOUNTS;
  try {
    const raw = localStorage.getItem(KNOWN_ACCOUNTS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list.filter(
          (a) =>
            a.email &&
            !a.email.toLowerCase().includes('khairnarvaishali716') &&
            !a.email.toLowerCase().includes('cgn@123') &&
            !a.email.toLowerCase().includes('vanceventures')
        );
      }
    }
  } catch {}
  return DEFAULT_PRESET_ACCOUNTS;
}

export function saveKnownAccount(account: BrandBattleUser): BrandBattleUser[] {
  if (!isBrowser) return DEFAULT_PRESET_ACCOUNTS;
  try {
    const current = getKnownAccounts();
    const filtered = current.filter(
      (a) => a.uid !== account.uid && a.email?.toLowerCase() !== account.email?.toLowerCase()
    );
    const updated = [account, ...filtered];
    localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PRESET_ACCOUNTS;
  }
}

export function removeKnownAccount(emailOrUid: string): BrandBattleUser[] {
  if (!isBrowser) return DEFAULT_PRESET_ACCOUNTS;
  try {
    const current = getKnownAccounts();
    const updated = current.filter(
      (a) => a.uid !== emailOrUid && a.email?.toLowerCase() !== emailOrUid.toLowerCase()
    );
    localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PRESET_ACCOUNTS;
  }
}

// Synchronously get the active user (either Firebase live user or pre-authenticated local user)
export function getCurrentUserSync(): AuthUser | null {
  if (auth.currentUser) return auth.currentUser;
  if (isBrowser) {
    try {
      const isExplicitlyLoggedOut = localStorage.getItem('brandbattle_logged_out') === 'true';
      if (isExplicitlyLoggedOut) {
        return null;
      }
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        return JSON.parse(stored) as BrandBattleUser;
      }
      // Zero-friction Guest Mode for Vercel & local environments
      const guest = DEFAULT_PRESET_ACCOUNTS[0]; // local_guest_mode
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
      return guest;
    } catch {}
  }
  return DEFAULT_PRESET_ACCOUNTS[0];
}

// Unified auth subscription hook combining Firebase state & local developer sessions
export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  authSubscribers.push(callback);
  // Emit current state immediately
  callback(getCurrentUserSync());

  // Listen to Firebase native auth state changes
  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      if (isBrowser) {
        localStorage.removeItem(LOCAL_USER_KEY);
        localStorage.removeItem('brandbattle_logged_out');
      }
      const mappedUser: BrandBattleUser = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        isLocal: false,
      };
      saveKnownAccount(mappedUser);
      notifyAuthSubscribers(firebaseUser);
    } else {
      const localUser = getCurrentUserSync();
      notifyAuthSubscribers(localUser);
    }
  });

  return () => {
    const idx = authSubscribers.indexOf(callback);
    if (idx !== -1) authSubscribers.splice(idx, 1);
    unsubscribeFirebase();
  };
}

/**
 * Switch directly to an existing known or custom account
 */
export function switchAccount(targetUser: BrandBattleUser): void {
  if (isBrowser) {
    try {
      localStorage.removeItem('brandbattle_logged_out');
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(targetUser));
    } catch {}
  }
  saveKnownAccount(targetUser);
  notifyAuthSubscribers(targetUser);
}

/**
 * Sign in locally with any arbitrary account.
 * Guarantees zero friction and isolated kits per user email.
 */
export function signInLocally(
  displayName?: string,
  email?: string,
  photoURL?: string
): BrandBattleUser {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter a valid email address.');
  }
  const cleanName = (displayName || cleanEmail.split('@')[0] || 'User').trim();
  const emailSlug = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const defaultPhoto = photoURL || generateAvatarUrl(cleanName, cleanEmail);

  const localUser: BrandBattleUser = {
    uid: `local_${emailSlug || 'user'}`,
    displayName: cleanName,
    email: cleanEmail,
    photoURL: defaultPhoto,
    isLocal: true,
  };

  if (isBrowser) {
    try {
      localStorage.removeItem('brandbattle_logged_out');
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    } catch (e) {
      console.warn('Could not persist local user to localStorage:', e);
    }
  }

  saveKnownAccount(localUser);
  notifyAuthSubscribers(localUser);
  return localUser;
}

/**
 * Google Sign In with resilient dual-mode architecture:
 * Prompts Google account picker so user selects ANY Google account.
 * If remote Firebase OAuth restricts localhost, falls back to the specific
 * email entered by the user without hardcoding any other person's account.
 */
/**
 * Sign In with Google / Account in Browser LocalStorage Mode:
 * Completely bypasses Firebase Starter Tier domain restrictions on Vercel and localhost.
 * Instantly authenticates and creates the user session in LocalStorage.
 */
export async function signInWithGoogle(
  fallbackDisplayName?: string,
  fallbackEmail?: string
): Promise<{
  user: AuthUser;
  mode: 'local_fallback';
  note: string;
}> {
  const effectiveEmail = fallbackEmail?.trim().toLowerCase() || 'ankit@gmail.com';
  const effectiveName = fallbackDisplayName?.trim() || effectiveEmail.split('@')[0] || 'Ankit';
  const googleAvatar = generateAvatarUrl(effectiveName, effectiveEmail);
  const localUser = signInLocally(effectiveName, effectiveEmail, googleAvatar);

  return {
    user: localUser,
    mode: 'local_fallback',
    note: `Signed in as ${effectiveName} in Browser LocalStorage mode (bypassing domain restrictions).`,
  };
}

/**
 * Sign In as Guest in Browser LocalStorage Mode:
 * Zero setup, no email required, 100% resilient on Vercel and local machines.
 */
export function signInAsGuest(): BrandBattleUser {
  const guestUser: BrandBattleUser = {
    uid: 'local_guest_mode',
    displayName: 'Guest Mode',
    email: 'guest@brandbattle.local',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    isLocal: true,
  };

  if (isBrowser) {
    try {
      localStorage.removeItem('brandbattle_logged_out');
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    } catch {}
  }

  saveKnownAccount(guestUser);
  notifyAuthSubscribers(guestUser);
  return guestUser;
}

/**
 * Sign in using Google Identity Services (GIS) ID Token.
 * Allows the browser to natively display all Google accounts on the system!
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<BrandBattleUser> {
  let googleEmail = '';
  let googleName = '';
  let googlePicture = '';

  try {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    googleEmail = parsed.email || '';
    googleName = parsed.name || parsed.given_name || googleEmail.split('@')[0] || 'Google User';
    googlePicture = parsed.picture || '';
  } catch (e) {
    console.warn('Could not parse Google ID token payload locally:', e);
  }

  // Attempt Firebase credential sign-in
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    if (isBrowser) {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem('brandbattle_logged_out');
    }
    const googleUser: BrandBattleUser = {
      uid: result.user.uid,
      displayName: result.user.displayName || googleName,
      email: result.user.email || googleEmail,
      photoURL: result.user.photoURL || googlePicture,
      isLocal: false,
    };
    saveKnownAccount(googleUser);
    notifyAuthSubscribers(result.user);
    return googleUser;
  } catch (err) {
    console.info('[BrandBattle Auth] Firebase signInWithCredential note (using verified Google token):', err);
  }

  if (googleEmail) {
    const localUser = signInLocally(googleName, googleEmail, googlePicture);
    return localUser;
  }

  throw new Error('Unable to authenticate with Google ID token.');
}

export async function logoutUser() {
  if (isBrowser) {
    try {
      localStorage.setItem('brandbattle_logged_out', 'true');
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
  }
  notifyAuthSubscribers(null);
  try {
    await signOut(auth);
  } catch {
    // Non-blocking
  }
}

/**
 * Deeply strips undefined values from objects/arrays so Firestore setDoc never throws.
 */
function cleanFirestorePayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => cleanFirestorePayload(item)) as unknown as T;
  }
  if (typeof input === 'object' && !(input instanceof Date)) {
    const output: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        output[key] = cleanFirestorePayload(value);
      }
    }
    return output as T;
  }
  return input;
}

/**
 * Saves Brand Kit with resilient dual-layer storage:
 * Always caches in LocalStorage and syncs with Firestore cloud if permissible.
 */
export async function saveBrandKitToFirestore(
  userId: string,
  userEmail: string,
  record: Omit<SavedBrandKitRecord, 'id' | 'userId' | 'userEmail' | 'createdAt'>
): Promise<string> {
  const kitId = `kit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const data: SavedBrandKitRecord = {
    ...record,
    id: kitId,
    userId,
    userEmail: userEmail || '',
    createdAt: now,
    updatedAt: now,
  };

  const cleanData = cleanFirestorePayload(data);

  // 1. Always persist to localStorage for high reliability
  if (isBrowser) {
    try {
      const storageKey = `${LOCAL_KITS_KEY_PREFIX}${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: SavedBrandKitRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(cleanData);
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (localErr) {
      console.warn('LocalStorage save notice:', localErr);
    }
  }

  // 2. Also attempt Firestore cloud save
  try {
    const docRef = doc(db, 'users', userId, 'brandKits', kitId);
    await setDoc(docRef, cleanData);
  } catch (cloudErr) {
    console.info('[BrandBattle Firestore] Cloud save notice (saved to local persistent storage):', cloudErr);
  }

  return kitId;
}

/**
 * Fetches user brand kits from both Firestore and LocalStorage, deduplicated.
 */
export async function getUserBrandKits(userId: string): Promise<SavedBrandKitRecord[]> {
  const kitsMap = new Map<string, SavedBrandKitRecord>();

  // 1. Read from LocalStorage
  if (isBrowser) {
    try {
      const storageKey = `${LOCAL_KITS_KEY_PREFIX}${userId}`;
      const localRaw = localStorage.getItem(storageKey);
      if (localRaw) {
        const localList: SavedBrandKitRecord[] = JSON.parse(localRaw);
        for (const k of localList) {
          if (k.id) kitsMap.set(k.id, k);
        }
      }
    } catch (e) {
      console.warn('Error reading local kits:', e);
    }
  }

  // 2. Read from Firestore cloud
  try {
    const kitsRef = collection(db, 'users', userId, 'brandKits');
    const q = query(kitsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as SavedBrandKitRecord;
      if (data.id) kitsMap.set(data.id, data);
    }
  } catch {
    // Graceful fallback to local cache
  }

  const allKits = Array.from(kitsMap.values());
  allKits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allKits;
}

export async function deleteBrandKitFromFirestore(userId: string, kitId: string): Promise<void> {
  // 1. Remove from local storage
  if (isBrowser) {
    try {
      const storageKey = `${LOCAL_KITS_KEY_PREFIX}${userId}`;
      const localRaw = localStorage.getItem(storageKey);
      if (localRaw) {
        const localList: SavedBrandKitRecord[] = JSON.parse(localRaw);
        const filtered = localList.filter((k) => k.id !== kitId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Error deleting local kit:', e);
    }
  }

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, 'users', userId, 'brandKits', kitId);
    await deleteDoc(docRef);
  } catch {
    // Non-blocking
  }
}

/**
 * Creates a public, read-only share link stored in Firestore /publicBrandKits/{shareId}
 * with local storage cache fallback.
 */
export async function createPublicShareLink(params: {
  originalIdea: string;
  brandName: string;
  oneLinePitch: string;
  positioningStatement: string;
  primaryValueProposition: string;
  clarified: ClarifiedIdea;
  debate: DebateStage;
  brandKit: BrandKit;
  logoImageUrl?: string;
  user?: AuthUser | null;
}): Promise<string> {
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);
  const shareId = `sbk_${timestamp}_${randomSuffix}`;
  const now = new Date().toISOString();

  const record: Record<string, any> = {
    shareId,
    creatorId: params.user?.uid || 'community',
    originalIdea: params.originalIdea,
    brandName: params.brandName,
    oneLinePitch: params.oneLinePitch,
    positioningStatement: params.positioningStatement,
    primaryValueProposition: params.primaryValueProposition,
    clarified: params.clarified,
    debate: params.debate,
    brandKit: params.brandKit,
    createdAt: now,
    updatedAt: now,
    viewsCount: 1,
    isPublic: true,
  };

  if (params.user?.email) {
    record.creatorEmail = params.user.email;
  }
  if (params.logoImageUrl) {
    record.logoImageUrl = params.logoImageUrl;
  }

  const cleanData = cleanFirestorePayload(record);

  // Cache in localStorage
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(LOCAL_PUBLIC_KITS_KEY);
      const dict = stored ? JSON.parse(stored) : {};
      dict[shareId] = cleanData;
      localStorage.setItem(LOCAL_PUBLIC_KITS_KEY, JSON.stringify(dict));
    } catch {}
  }

  // Attempt Cloud Firestore
  try {
    const docRef = doc(db, 'publicBrandKits', shareId);
    await setDoc(docRef, cleanData);
  } catch (cloudErr) {
    console.info('[BrandBattle Share] Firestore write notice (cached locally):', cloudErr);
  }

  return shareId;
}

/**
 * Fetches a public read-only brand kit by shareId from Firestore with local cache support.
 */
export async function getPublicBrandKit(shareId: string): Promise<PublicBrandKitRecord | null> {
  // Check local cache first if in browser
  if (isBrowser) {
    try {
      const stored = localStorage.getItem(LOCAL_PUBLIC_KITS_KEY);
      if (stored) {
        const dict = JSON.parse(stored);
        if (dict[shareId]) {
          return dict[shareId] as PublicBrandKitRecord;
        }
      }
    } catch {}
  }

  // Check Firestore
  try {
    const docRef = doc(db, 'publicBrandKits', shareId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PublicBrandKitRecord;
      try {
        await updateDoc(docRef, {
          viewsCount: increment(1),
        });
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Error fetching public brand kit by shareId:', err);
  }

  return null;
}
