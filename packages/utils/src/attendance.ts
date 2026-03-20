import type { AttendanceRecord, AttendanceStatus, Term } from "@educore/types";

// ─── TYPES ────────────────────────────────────────────────────────────────

export interface AttendanceSummary {
  totalDays:    number;
  present:      number;
  absent:       number;
  late:         number;
  excused:      number;
  attendanceRate: number; // percentage 0-100
}

// ─── CALCULATE SUMMARY ────────────────────────────────────────────────────

/**
 * Calculate attendance summary for a student in a given term.
 */
export function calculateAttendanceSummary(
  records: AttendanceRecord[],
  totalSchoolDays: number
): AttendanceSummary {
  const present = records.filter((r) => r.status === "present").length;
  const absent  = records.filter((r) => r.status === "absent").length;
  const late    = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;

  // Present + late counts as attending for rate calculation
  const attended     = present + late;
  const attendanceRate = totalSchoolDays > 0
    ? parseFloat(((attended / totalSchoolDays) * 100).toFixed(1))
    : 0;

  return {
    totalDays: totalSchoolDays,
    present,
    absent,
    late,
    excused,
    attendanceRate,
  };
}

/**
 * Check if a student has already been marked for a given date.
 */
export function isAlreadyMarked(
  records: AttendanceRecord[],
  studentId: string,
  date: string
): boolean {
  return records.some(
    (r) => r.studentId === studentId && r.date === date
  );
}

/**
 * Get attendance records for a specific class on a specific date.
 */
export function getClassAttendanceForDate(
  records: AttendanceRecord[],
  classId: string,
  date: string
): AttendanceRecord[] {
  return records.filter((r) => r.classId === classId && r.date === date);
}

/**
 * Format date for attendance records: "2026-03-20"
 */
export function formatAttendanceDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

/**
 * Get today's date formatted for attendance.
 */
export function todayForAttendance(): string {
  return formatAttendanceDate(new Date());
}

/**
 * Count unique school days in a set of records.
 */
export function countUniqueDays(records: AttendanceRecord[]): number {
  const days = new Set(records.map((r) => r.date));
  return days.size;
}
