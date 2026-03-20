import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";
import type { AppUser, UserRole } from "@educore/types";

// ─── SIGN IN ───────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Update last login
  await setDoc(
    doc(db, "users", cred.user.uid),
    { lastLoginAt: serverTimestamp() },
    { merge: true }
  );

  return cred.user;
}

// ─── SIGN OUT ──────────────────────────────────────────────────────────────

export async function signOut() {
  await firebaseSignOut(auth);
}

// ─── GET CURRENT USER PROFILE ─────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

// ─── GET ROLE FROM CUSTOM CLAIMS ──────────────────────────────────────────

export async function getUserClaims(user: User): Promise<{
  role: UserRole;
  schoolId: string | null;
  permissions: string[];
} | null> {
  const token = await user.getIdTokenResult();
  const claims = token.claims;

  if (!claims["role"]) return null;

  return {
    role: claims["role"] as UserRole,
    schoolId: (claims["schoolId"] as string) ?? null,
    permissions: (claims["permissions"] as string[]) ?? [],
  };
}

// ─── CHANGE PASSWORD (first login flow) ───────────────────────────────────

export async function changePassword(newPassword: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  await updatePassword(user, newPassword);
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────

export async function sendReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ─── AUTH STATE LISTENER ──────────────────────────────────────────────────

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── GET ID TOKEN FOR API CALLS ───────────────────────────────────────────

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ─── CHECK IF FIRST LOGIN (needs password change) ─────────────────────────

export async function isFirstLogin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;
  const data = snap.data() as AppUser;
  // First login if lastLoginAt is null (never logged in before via app)
  return data.lastLoginAt === null;
}
