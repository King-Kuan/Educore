import admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

function createAdminApp(): App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey,
    }),
  });
}

export const adminApp: App = createAdminApp();
export const adminAuth: Auth = admin.auth(adminApp);
export const adminDb: Firestore = admin.firestore(adminApp);

/**
 * Verify a Firebase ID token server-side.
 * Use in API routes and middleware.
 */
export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}

/**
 * Set custom claims on a user (used to attach role + schoolId).
 * Called after creating a new user via invite.
 */
export async function setUserClaims(
  uid: string,
  claims: {
    role: string;
    schoolId: string | null;
    permissions: string[];
  }
) {
  await adminAuth.setCustomUserClaims(uid, claims);
}

/**
 * Create a Firebase Auth user with email + temporary password.
 * Used when principal invites a teacher.
 */
export async function createAuthUser(email: string, displayName: string) {
  const tempPassword = generateTempPassword();
  const user = await adminAuth.createUser({
    email,
    displayName,
    password: tempPassword,
    emailVerified: false,
  });
  return { uid: user.uid, tempPassword };
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}
