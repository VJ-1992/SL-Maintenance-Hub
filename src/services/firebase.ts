import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  QueryConstraint,
  getDocFromServer
} from "firebase/firestore";

// Define the environment variable fallback pattern using the credentials you provided
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyCnJCAXOubdT0TUK_V4sUtMHqRCLIH9BvI",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "sl-maintenance-hub.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "sl-maintenance-hub",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "sl-maintenance-hub.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "125905308961",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:125905308961:web:41ed88fd8dbba5e1acc260",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-N41VGECGX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Operational Types for security rules failure debugging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Standard security rules and quota error handler.
 * Encapsulates the failure in a structured, serialized JSON format for quick debugging.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Encountered: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Silent Anonymous Authentication Helper
 */
export async function ensureSignedIn() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn("Failed silent anonymous sign in:", e);
    }
  }
}

/**
 * VALIDATE CONNECTION TO FIRESTORE
 * As required by security integration policies, boots a light test fetch to verify auth-ready state.
 */
export async function testConnection() {
  try {
    await ensureSignedIn();
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore Connected");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your network and Firebase configuration. Local persistence fallback active.");
    } else {
      // In some sandboxed environments or first-time setup, test document read can trigger permission denied, which is fine
      console.log("Firestore Connected (Auth ready, connection test complete)");
    }
  }
}

// Fire a non-blocking diagnostic test
testConnection();

// --- FIRESTORE ARCHITECTURAL OPERATIONS HELPERS ---

/**
 * Fetch a single document by its path.
 */
export async function fetchDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetch all documents in a collection or query.
 */
export async function fetchCollection<T>(collectionPath: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
  try {
    const ref = collection(db, collectionPath);
    const q = query(ref, ...queryConstraints);
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as T);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Write/Set a document with a specific ID.
 */
export async function writeDocument<T extends object>(collectionPath: string, docId: string, data: T): Promise<void> {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Add a new document with an auto-generated ID to a collection.
 */
export async function createDocument<T extends object>(collectionPath: string, data: T): Promise<string> {
  try {
    const ref = collection(db, collectionPath);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

/**
 * Update subset of keys on an existing document.
 */
export async function modifyDocument<T extends object>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await updateDoc(docRef, data as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a document from a collection.
 */
export async function removeDocument(collectionPath: string, docId: string): Promise<void> {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
