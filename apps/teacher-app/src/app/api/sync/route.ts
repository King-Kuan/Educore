import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@educore/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

// POST /api/sync  (called by teacher app sync engine)
// Body: { schoolId, operation, collection, docId, data }
export async function POST(request: Request) {
  // Auth via Bearer token
  const auth  = request.headers.get("Authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const body    = await request.json();
    const { schoolId, operation, collection: colPath, docId, data } = body;

    if (!schoolId || !colPath || !data) {
      return NextResponse.json({ error: "schoolId, collection, data required" }, { status: 400 });
    }

    // Security: ensure user belongs to this school
    if (decoded["schoolId"] !== schoolId && decoded["role"] !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Resolve Firestore path
    // collection can be "marks", "attendance", "schools/{id}/marks" etc.
    const fullPath = colPath.startsWith("schools/")
      ? colPath
      : `schools/${schoolId}/${colPath}`;

    const colRef = adminDb.collection(fullPath);
    const now    = Timestamp.now();

    if (operation === "create") {
      // Upsert: for marks/attendance, check if doc already exists
      if (colPath.includes("marks") || colPath.includes("attendance")) {
        const existing = await colRef.where("studentId", "==", data["studentId"])
          .where("subjectId", "==", data["subjectId"] ?? "")
          .where("date",      "==", data["date"]      ?? "")
          .where("term",      "==", data["term"])
          .where("academicYear", "==", data["academicYear"])
          .limit(1).get();

        if (!existing.empty) {
          await existing.docs[0]!.ref.update({ ...data, updatedAt: now });
        } else {
          await colRef.add({ ...data, createdAt: now, updatedAt: now });
        }
      } else {
        await colRef.add({ ...data, createdAt: now, updatedAt: now });
      }
    } else if (operation === "update" && docId) {
      await colRef.doc(docId).update({ ...data, updatedAt: now });
    } else if (operation === "delete" && docId) {
      await colRef.doc(docId).delete();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
