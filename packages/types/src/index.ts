import type { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────
// ENUMS & LITERAL UNIONS
// ─────────────────────────────────────────────

export type UserRole = "superadmin" | "principal" | "deputy" | "teacher";
export type UserStatus = "active" | "suspended" | "pending";
export type Term = 1 | 2 | 3;
export type Gender = "M" | "F";
export type StudentStatus = "active" | "transferred" | "graduated" | "withdrawn";
export type PlanType = "flat" | "per_student";
export type SubscriptionStatus = "active" | "expired" | "trial" | "suspended";
export type GradingType = "percentage" | "descriptors";
export type FileType = "homework" | "test" | "exercise" | "resource";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type AdAudience = "principal" | "teacher" | "parent";
export type InvitationStatus = "pending" | "accepted" | "expired";
export type DecisionType = "promoted" | "second_sitting" | "repeat" | "discontinued";

// Rwanda 7-grade scale matching Ministry of Education
export type LetterGrade = "A" | "B" | "C" | "D" | "E" | "S" | "F";

// Nursery descriptor grades
export type DescriptorGrade = "Excellent" | "Very Good" | "Good" | "Satisfactory";

// ─────────────────────────────────────────────
// SCHOOL
// ─────────────────────────────────────────────

export interface School {
  id: string;
  name: string;
  /** 3-digit unique code e.g. "001". Used in student IDs */
  code: string;
  /** Short abbreviation e.g. "GSK" */
  abbreviation: string;
  logoUrl: string | null;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  country: "Rwanda";
  planType: PlanType;
  studentCount: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: Timestamp | null;
  /** Set by superadmin when approving */
  approvedAt: Timestamp | null;
  approvedBy: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// ─────────────────────────────────────────────
// USER (Firebase Auth UID as doc ID)
// ─────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  role: UserRole;
  /** null for superadmin */
  schoolId: string | null;
  /** Custom permissions for deputy role, e.g. ["view_reports","manage_students"] */
  permissions: string[];
  status: UserStatus;
  createdAt: Timestamp;
  createdBy: string;
  lastLoginAt: Timestamp | null;
}

// Deputy permission constants
export const DEPUTY_PERMISSIONS = [
  "manage_students",
  "manage_teachers",
  "manage_classes",
  "view_marks",
  "lock_marks",
  "generate_reports",
  "manage_timetable",
  "view_attendance",
  "manage_files",
  "view_ads",
] as const;

export type DeputyPermission = (typeof DEPUTY_PERMISSIONS)[number];

// ─────────────────────────────────────────────
// SCHOOL LEVEL (e.g. Nursery, Lower Primary…)
// ─────────────────────────────────────────────

export interface SchoolLevel {
  id: string;
  schoolId: string;
  name: string; // free text: "Nursery", "Lower Primary", "O-Level" etc.
  gradingType: GradingType;
  /** Only for descriptor grading */
  descriptors: DescriptorGrade[];
  /** Pass mark percentage (default 50) */
  passMark: number;
  /** Sort order for display */
  order: number;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// CLASS
// ─────────────────────────────────────────────

export interface SchoolClass {
  id: string;
  schoolId: string;
  levelId: string;
  name: string; // e.g. "P5 A", "S2 B", "Nursery 2"
  classTeacherId: string;
  /** All teacher UIDs assigned to this class */
  teacherIds: string[];
  academicYear: string; // e.g. "2025-2026"
  capacity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// SUBJECT
// ─────────────────────────────────────────────

export interface Subject {
  id: string;
  schoolId: string;
  levelId: string;
  name: string; // e.g. "Mathematics", "ICT", "SET"
  /** CA (Continuous Assessment) max set by headmaster */
  caMax: number;
  /** Exam max set by headmaster */
  examMax: number;
  /** Computed: caMax + examMax */
  totalMax: number;
  /** For annual report: totalMax × 3 terms */
  annualMax: number;
  /** Display order */
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────────

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  levelId: string;
  /**
   * Format: SchoolAbbrev·AcadYearShort·SequentialNumber
   * e.g. "GSK·2526·0042"
   * SchoolCode (3-digit) + AcademicYear short (e.g. 2526) + 4-digit seq
   */
  studentCode: string;
  firstName: string;
  lastName: string;
  /** Full name for display: LASTNAME Firstname */
  fullName: string;
  dateOfBirth: Timestamp;
  gender: Gender;
  photoUrl: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  /** Registration number as shown on official reports e.g. "1785250006" */
  registrationNumber: string;
  academicYear: string;
  status: StudentStatus;
  enrolledAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// MARKS
// ─────────────────────────────────────────────

export interface Mark {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  term: Term;
  academicYear: string;
  caScore: number | null;
  examScore: number | null;
  /** Computed: caScore + examScore */
  totalScore: number | null;
  /** Percentage of totalMax */
  percentage: number | null;
  grade: LetterGrade | DescriptorGrade | null;
  /** Locked by principal — no edits allowed after lock */
  isLocked: boolean;
  lockedAt: Timestamp | null;
  lockedBy: string | null;
  submittedAt: Timestamp;
  updatedAt: Timestamp;
}

// Conduct mark — no CA/Exam split, just a total out of 40
export interface ConductMark {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  /** Assessed by class teacher */
  teacherId: string;
  term: Term;
  academicYear: string;
  score: number; // out of 40
  grade: LetterGrade;
  isLocked: boolean;
  submittedAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  teacherId: string;
  /** ISO date string "2026-03-20" */
  date: string;
  status: AttendanceStatus;
  note: string | null;
  term: Term;
  academicYear: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  /** 1=Monday, 2=Tuesday … 5=Friday */
  dayOfWeek: 1 | 2 | 3 | 4 | 5;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  room: string | null;
  term: Term;
  academicYear: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// FILES (uploaded by teachers → Cloudflare R2)
// ─────────────────────────────────────────────

export interface FileFolder {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string | null;
  name: string;
  type: FileType | "custom";
  createdBy: string;
  createdAt: Timestamp;
}

export interface UploadedFile {
  id: string;
  schoolId: string;
  folderId: string;
  classId: string;
  subjectId: string | null;
  uploadedBy: string;
  title: string;
  description: string | null;
  type: FileType;
  /** Cloudflare R2 object key */
  r2Key: string;
  /** Signed URL cached — regenerated on access */
  fileUrl: string | null;
  fileSize: number; // bytes
  mimeType: string;
  term: Term;
  academicYear: string;
  uploadedAt: Timestamp;
  /** Exactly 4 months after uploadedAt */
  expiresAt: Timestamp;
  isDeleted: boolean;
}

// ─────────────────────────────────────────────
// REPORT SNAPSHOT (for caching computed data)
// ─────────────────────────────────────────────

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  caMax: number;
  caScore: number | null;
  examMax: number;
  examScore: number | null;
  totalMax: number;
  totalScore: number | null;
  percentage: number | null;
  grade: LetterGrade | DescriptorGrade | null;
}

export interface TermReport {
  studentId: string;
  classId: string;
  schoolId: string;
  term: Term;
  academicYear: string;
  subjects: SubjectResult[];
  conductScore: number;
  conductGrade: LetterGrade;
  grandTotal: number;
  grandMax: number;
  percentage: number;
  position: number;
  totalStudents: number;
  grade: LetterGrade;
  attendanceDays: number;
  totalDays: number;
  classTeacherComment: string;
  headTeacherComment: string;
  generatedAt: Timestamp;
}

export interface AnnualReport extends Omit<TermReport, "term"> {
  term1: TermReport;
  term2: TermReport;
  term3: TermReport;
  annualTotal: number;
  annualMax: number;
  annualPercentage: number;
  annualPosition: number;
  annualGrade: LetterGrade;
  firstDecision: DecisionType;
  finalDecision: DecisionType;
  promotedToClass: string | null;
}

// ─────────────────────────────────────────────
// INVITATIONS
// ─────────────────────────────────────────────

export interface Invitation {
  id: string;
  email: string;
  role: Exclude<UserRole, "superadmin">;
  schoolId: string;
  /** Hashed token — raw token sent by email */
  tokenHash: string;
  createdBy: string;
  expiresAt: Timestamp;
  usedAt: Timestamp | null;
  status: InvitationStatus;
}

// ─────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string | null;
  targetAudience: AdAudience[];
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdBy: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────

export interface BillingRecord {
  id: string;
  schoolId: string;
  academicYear: string;
  studentCount: number;
  planType: PlanType;
  amountRwf: number;
  paidAt: Timestamp | null;
  dueDate: Timestamp;
  status: "pending" | "paid" | "overdue";
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────
// OFFLINE SYNC (IndexedDB — teacher app only)
// ─────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  collection: string;
  docId: string;
  data: Record<string, unknown>;
  createdAt: number; // Date.now()
  attempts: number;
  lastError: string | null;
}

// ─────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────

/** Remove id and timestamps for creation payloads */
export type CreatePayload<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

/** Make all fields optional for update payloads */
export type UpdatePayload<T> = Partial<Omit<T, "id" | "schoolId" | "createdAt">>;

/** Firestore document with id injected */
export type WithId<T> = T & { id: string };

/** Grading result returned by grading util */
export interface GradingResult {
  grade: LetterGrade;
  descriptor: string;
  percentage: number;
  passed: boolean;
  value: number; // 0-6 numeric value for sorting
}
