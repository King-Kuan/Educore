import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "./client";
import type {
  School,
  AppUser,
  SchoolLevel,
  SchoolClass,
  Subject,
  Student,
  Mark,
  ConductMark,
  AttendanceRecord,
  TimetableSlot,
  FileFolder,
  UploadedFile,
  Invitation,
  Ad,
  BillingRecord,
} from "@educore/types";

// ─── ROOT COLLECTIONS ──────────────────────────────────────────────────────

export const schoolsCol = () =>
  collection(db, "schools") as CollectionReference<School>;

export const usersCol = () =>
  collection(db, "users") as CollectionReference<AppUser>;

export const invitationsCol = () =>
  collection(db, "invitations") as CollectionReference<Invitation>;

export const adsCol = () =>
  collection(db, "ads") as CollectionReference<Ad>;

// ─── SCHOOL SUB-COLLECTIONS ────────────────────────────────────────────────

export const schoolDoc = (schoolId: string) =>
  doc(db, "schools", schoolId) as DocumentReference<School>;

export const levelsCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "schoolLevels") as CollectionReference<SchoolLevel>;

export const classesCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "classes") as CollectionReference<SchoolClass>;

export const subjectsCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "subjects") as CollectionReference<Subject>;

export const studentsCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "students") as CollectionReference<Student>;

export const marksCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "marks") as CollectionReference<Mark>;

export const conductCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "conduct") as CollectionReference<ConductMark>;

export const attendanceCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "attendance") as CollectionReference<AttendanceRecord>;

export const timetableCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "timetable") as CollectionReference<TimetableSlot>;

export const foldersCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "fileFolders") as CollectionReference<FileFolder>;

export const filesCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "files") as CollectionReference<UploadedFile>;

export const billingCol = (schoolId: string) =>
  collection(db, "schools", schoolId, "billing") as CollectionReference<BillingRecord>;

// ─── DOCUMENT HELPERS ──────────────────────────────────────────────────────

export const studentDoc = (schoolId: string, studentId: string) =>
  doc(db, "schools", schoolId, "students", studentId) as DocumentReference<Student>;

export const markDoc = (schoolId: string, markId: string) =>
  doc(db, "schools", schoolId, "marks", markId) as DocumentReference<Mark>;

export const userDoc = (uid: string) =>
  doc(db, "users", uid) as DocumentReference<AppUser>;
