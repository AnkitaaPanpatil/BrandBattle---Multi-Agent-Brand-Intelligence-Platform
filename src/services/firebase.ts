import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
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
import { SavedBrandKitRecord, PublicBrandKitRecord, ClarifiedIdea, DebateStage, BrandKit } from '../types/brand.js';

// Suppress verbose SDK stream teardown notices
setLogLevel('error');

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Connection check with graceful fallback
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected on fresh or empty instances; safely ignored
  }
}
testConnection();

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

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth sign in failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

export async function saveBrandKitToFirestore(userId: string, userEmail: string, record: Omit<SavedBrandKitRecord, 'id' | 'userId' | 'userEmail' | 'createdAt'>): Promise<string> {
  const kitId = `kit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  
  const docRef = doc(db, 'users', userId, 'brandKits', kitId);
  const data: SavedBrandKitRecord = {
    ...record,
    id: kitId,
    userId,
    userEmail: userEmail || '',
    createdAt: now,
    updatedAt: now,
  };

  const cleanData = cleanFirestorePayload(data);
  await setDoc(docRef, cleanData);
  return kitId;
}

export async function getUserBrandKits(userId: string): Promise<SavedBrandKitRecord[]> {
  try {
    const kitsRef = collection(db, 'users', userId, 'brandKits');
    const q = query(kitsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SavedBrandKitRecord);
  } catch (err) {
    console.error('Error fetching user brand kits:', err);
    return [];
  }
}

export async function deleteBrandKitFromFirestore(userId: string, kitId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'brandKits', kitId);
  await deleteDoc(docRef);
}

/**
 * Creates a public, read-only share link stored in Firestore /publicBrandKits/{shareId}
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
  user?: User | null;
}): Promise<string> {
  // Generate high-entropy unique share identifier
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
  const docRef = doc(db, 'publicBrandKits', shareId);
  await setDoc(docRef, cleanData);
  return shareId;
}

/**
 * Fetches a public read-only brand kit by shareId from Firestore
 */
export async function getPublicBrandKit(shareId: string): Promise<PublicBrandKitRecord | null> {
  try {
    const docRef = doc(db, 'publicBrandKits', shareId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data() as PublicBrandKitRecord;

    // Asynchronously bump views count
    try {
      await updateDoc(docRef, {
        viewsCount: increment(1),
      });
    } catch {
      // Non-blocking
    }

    return data;
  } catch (err) {
    console.error('Error fetching public brand kit by shareId:', err);
    return null;
  }
}

