import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyIdToken } from "@educore/firebase/admin";
import type { UserRole } from "@educore/types";

export interface SessionClaims {
  uid:         string;
  role:        UserRole;
  schoolId:    string | null;
  permissions: string[];
}

/**
 * Verify session cookie and return decoded claims.
 * Returns null + 401 response if invalid.
 */
export async function getSession(): Promise<
  { claims: SessionClaims; error: null } |
  { claims: null; error: NextResponse }
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;

    if (!token) {
      return {
        claims: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const decoded = await verifyIdToken(token);
    const role    = decoded["role"] as UserRole;

    if (!role) {
      return {
        claims: null,
        error: NextResponse.json({ error: "No role" }, { status: 403 }),
      };
    }

    return {
      claims: {
        uid:         decoded.uid,
        role,
        schoolId:    (decoded["schoolId"] as string) ?? null,
        permissions: (decoded["permissions"] as string[]) ?? [],
      },
      error: null,
    };
  } catch {
    return {
      claims: null,
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}

/**
 * Require a specific role or return 403.
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<{ claims: SessionClaims; error: null } | { claims: null; error: NextResponse }> {
  const result = await getSession();
  if (result.error) return result;

  if (!roles.includes(result.claims.role)) {
    return {
      claims: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

/**
 * Require that the user belongs to a specific school.
 */
export async function requireSchoolAccess(schoolId: string) {
  const result = await getSession();
  if (result.error) return result;

  const { role, schoolId: userSchoolId } = result.claims;

  if (role !== "superadmin" && userSchoolId !== schoolId) {
    return {
      claims: null,
      error: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  }

  return result;
}
