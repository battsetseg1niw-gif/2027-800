import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  query,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { StudentBadge } from "../types/badge";
import { UserProfile, ExamSubmission } from "../types";

// 1. Initialize Firebase App and Services
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const firestore: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Validate connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestore, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or network status.");
    }
    return false;
  }
}

// Call connection test after client initialization
if (typeof window !== "undefined") {
  setTimeout(() => {
    testFirestoreConnection().catch(() => {});
  }, 1200);
}

// 3. Structured Firestore Error Handler (conforming to FirestoreErrorInfo)
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Firebase Google Sign-In error:", err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Firebase Sign-Out error:", err);
    throw err;
  }
}

export function onAuthUserChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 5. Sync Student Badges & Milestones to Firestore
export async function syncBadgesToFirestore(
  userId: string,
  badges: StudentBadge[],
  stats: { totalExams: number; topScore: number; mistakesFixed: number }
): Promise<void> {
  if (!userId) return;

  const userDocPath = `users/${userId}`;
  try {
    // 1. Update/Save user profile milestone summary
    await setDoc(
      doc(firestore, "users", userId),
      {
        totalExamsCompleted: stats.totalExams,
        topScaledScore: stats.topScore,
        mistakesCorrected: stats.mistakesFixed,
        unlockedBadgeCount: badges.filter((b) => b.isUnlocked).length,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userDocPath);
  }

  // 2. Persist unlocked badges in subcollection
  for (const badge of badges) {
    if (badge.isUnlocked) {
      const badgeDocPath = `users/${userId}/badges/${badge.id}`;
      try {
        await setDoc(
          doc(firestore, "users", userId, "badges", badge.id),
          {
            id: badge.id,
            badgeId: badge.id,
            userId,
            title: badge.title,
            titleEn: badge.titleEn,
            category: badge.category,
            tier: badge.tier,
            unlockedAt: badge.unlockedAt || new Date().toISOString(),
            rewardXp: badge.rewardXp || 100,
          },
          { merge: true }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, badgeDocPath);
      }
    }
  }
}

// 6. Fetch Student Badges from Firestore
export async function fetchUserBadgesFromFirestore(userId: string): Promise<Record<string, string>> {
  if (!userId) return {};
  const path = `users/${userId}/badges`;
  try {
    const snap = await getDocs(collection(firestore, "users", userId, "badges"));
    const unlockedMap: Record<string, string> = {};
    snap.forEach((d) => {
      const data = d.data();
      if (data.badgeId && data.unlockedAt) {
        unlockedMap[data.badgeId] = data.unlockedAt;
      }
    });
    return unlockedMap;
  } catch (error) {
    // Gracefully report error
    console.warn("Notice reading badges from Firestore:", error);
    return {};
  }
}
