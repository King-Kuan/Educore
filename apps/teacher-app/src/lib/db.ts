import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { SyncQueueItem } from "@educore/types";

// ─── SCHEMA ────────────────────────────────────────────────────────────────

interface EduCoreDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-createdAt": number };
  };
  cachedStudents: {
    key: string; // classId
    value: { classId: string; students: unknown[]; cachedAt: number };
  };
  cachedMarks: {
    key: string; // `${classId}_${subjectId}_${term}_${year}`
    value: { key: string; marks: unknown[]; cachedAt: number };
  };
  cachedTimetable: {
    key: string; // teacherId
    value: { teacherId: string; slots: unknown[]; cachedAt: number };
  };
  offlineMarks: {
    key: string; // `${studentId}_${subjectId}_${term}_${year}`
    value: {
      key: string;
      studentId:  string;
      subjectId:  string;
      classId:    string;
      caScore:    number;
      examScore:  number;
      term:       number;
      academicYear: string;
      savedAt:    number;
      synced:     boolean;
    };
  };
}

// ─── DB SINGLETON ─────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<EduCoreDB>> | null = null;

function getDB(): Promise<IDBPDatabase<EduCoreDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EduCoreDB>("educore-teacher", 1, {
      upgrade(db) {
        // Sync queue
        const sq = db.createObjectStore("syncQueue", { keyPath: "id" });
        sq.createIndex("by-createdAt", "createdAt");

        // Caches
        db.createObjectStore("cachedStudents", { keyPath: "classId" });
        db.createObjectStore("cachedMarks",    { keyPath: "key" });
        db.createObjectStore("cachedTimetable",{ keyPath: "teacherId" });
        db.createObjectStore("offlineMarks",   { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

// ─── SYNC QUEUE ────────────────────────────────────────────────────────────

export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "createdAt" | "attempts" | "lastError">): Promise<void> {
  const db = await getDB();
  await db.add("syncQueue", {
    ...item,
    id:        crypto.randomUUID(),
    createdAt: Date.now(),
    attempts:  0,
    lastError: null,
  });
}

export async function getPendingQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-createdAt");
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function updateQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db   = await getDB();
  const item = await db.get("syncQueue", id);
  if (item) await db.put("syncQueue", { ...item, ...updates });
}

export async function getQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count("syncQueue");
}

// ─── OFFLINE MARKS ────────────────────────────────────────────────────────

export async function saveMarkOffline(mark: {
  studentId:   string;
  subjectId:   string;
  classId:     string;
  caScore:     number;
  examScore:   number;
  term:        number;
  academicYear: string;
}): Promise<void> {
  const db  = await getDB();
  const key = `${mark.studentId}_${mark.subjectId}_${mark.term}_${mark.academicYear}`;
  await db.put("offlineMarks", { ...mark, key, savedAt: Date.now(), synced: false });
  // Also queue for sync
  await addToSyncQueue({ operation: "create", collection: "marks", docId: key, data: mark });
}

export async function getOfflineMarksForClass(
  classId: string, subjectId: string, term: number, year: string
): Promise<Record<string, { caScore: number; examScore: number }>> {
  const db    = await getDB();
  const all   = await db.getAll("offlineMarks");
  const result: Record<string, { caScore: number; examScore: number }> = {};

  all.filter((m) => m.classId === classId && m.subjectId === subjectId && m.term === term && m.academicYear === year)
     .forEach((m) => { result[m.studentId] = { caScore: m.caScore, examScore: m.examScore }; });

  return result;
}

// ─── CACHE STUDENTS ────────────────────────────────────────────────────────

export async function cacheStudents(classId: string, students: unknown[]): Promise<void> {
  const db = await getDB();
  await db.put("cachedStudents", { classId, students, cachedAt: Date.now() });
}

export async function getCachedStudents(classId: string): Promise<unknown[] | null> {
  const db   = await getDB();
  const data = await db.get("cachedStudents", classId);
  if (!data) return null;
  // Cache valid for 1 hour
  if (Date.now() - data.cachedAt > 3600_000) return null;
  return data.students;
}

// ─── SYNC ENGINE ────────────────────────────────────────────────────────────

export async function syncPendingItems(schoolId: string, idToken: string): Promise<{
  synced: number;
  failed: number;
}> {
  const pending = await getPendingQueue();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const res = await fetch(`/api/sync`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ schoolId, ...item }),
      });

      if (res.ok) {
        await removeFromQueue(item.id);
        synced++;
      } else {
        await updateQueueItem(item.id, {
          attempts:  item.attempts + 1,
          lastError: `HTTP ${res.status}`,
        });
        failed++;
      }
    } catch (err) {
      await updateQueueItem(item.id, {
        attempts:  item.attempts + 1,
        lastError: String(err),
      });
      failed++;
    }
  }

  return { synced, failed };
}
