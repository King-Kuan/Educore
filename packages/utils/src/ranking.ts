import type { LetterGrade } from "@educore/types";
import { calculateGrade } from "./grading";

// ─── TYPES ────────────────────────────────────────────────────────────────

export interface StudentScore {
  studentId: string;
  fullName: string;
  totalScore: number;
  totalMax: number;
  conductScore: number;
  grandTotal: number;  // totalScore + conductScore
  grandMax: number;    // totalMax + 40 (conduct)
}

export interface RankedStudent extends StudentScore {
  percentage: number;
  grade: LetterGrade;
  position: number; // 1-based
  /** true if tied with previous student */
  isTied: boolean;
}

// ─── RANKING ─────────────────────────────────────────────────────────────

/**
 * Rank all students in a class by their grand total (subjects + conduct).
 * Tied students get the same position (dense ranking — 1,2,2,3 not 1,2,2,4).
 */
export function rankStudents(students: StudentScore[]): RankedStudent[] {
  if (students.length === 0) return [];

  // Sort descending by grandTotal, then alphabetically for ties
  const sorted = [...students].sort((a, b) => {
    if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
    return a.fullName.localeCompare(b.fullName);
  });

  const ranked: RankedStudent[] = [];
  let currentPosition = 1;

  for (let i = 0; i < sorted.length; i++) {
    const student = sorted[i]!;
    const prevStudent = i > 0 ? sorted[i - 1] : null;

    // Same total as previous = same position (tied)
    const isTied = prevStudent !== null && student.grandTotal === prevStudent.grandTotal;
    if (isTied) {
      // Keep same position as previous
    } else {
      currentPosition = i + 1;
    }

    const percentage = student.grandMax > 0
      ? parseFloat(((student.grandTotal / student.grandMax) * 100).toFixed(2))
      : 0;

    const gradingResult = calculateGrade(student.grandTotal, student.grandMax);

    ranked.push({
      ...student,
      percentage,
      grade: gradingResult.grade,
      position: currentPosition,
      isTied,
    });
  }

  return ranked;
}

/**
 * Get a single student's position in a ranked list.
 */
export function getStudentPosition(
  studentId: string,
  rankedStudents: RankedStudent[]
): { position: number; total: number } | null {
  const found = rankedStudents.find((s) => s.studentId === studentId);
  if (!found) return null;
  return { position: found.position, total: rankedStudents.length };
}

/**
 * For annual report: combine 3 terms and rank.
 * Each term's grandTotal is summed; grandMax is grandMax × 3.
 */
export function rankStudentsAnnually(
  termRankings: {
    term: 1 | 2 | 3;
    students: RankedStudent[];
  }[]
): {
  studentId: string;
  term1Total: number;
  term2Total: number;
  term3Total: number;
  annualTotal: number;
  annualMax: number;
  annualPercentage: number;
  annualGrade: LetterGrade;
  annualPosition: number;
}[] {
  // Collect all unique student IDs
  const allIds = new Set<string>();
  termRankings.forEach((t) => t.students.forEach((s) => allIds.add(s.studentId)));

  const combined = Array.from(allIds).map((studentId) => {
    const t1 = termRankings.find((t) => t.term === 1)?.students.find((s) => s.studentId === studentId);
    const t2 = termRankings.find((t) => t.term === 2)?.students.find((s) => s.studentId === studentId);
    const t3 = termRankings.find((t) => t.term === 3)?.students.find((s) => s.studentId === studentId);

    const term1Total = t1?.grandTotal ?? 0;
    const term2Total = t2?.grandTotal ?? 0;
    const term3Total = t3?.grandTotal ?? 0;
    const annualTotal = term1Total + term2Total + term3Total;

    // grandMax should be same for all terms — use whichever exists
    const singleTermMax = t1?.grandMax ?? t2?.grandMax ?? t3?.grandMax ?? 0;
    const annualMax = singleTermMax * 3;

    const annualPercentage = annualMax > 0
      ? parseFloat(((annualTotal / annualMax) * 100).toFixed(2))
      : 0;
    const annualGrade = calculateGrade(annualTotal, annualMax).grade;

    return {
      studentId,
      term1Total,
      term2Total,
      term3Total,
      annualTotal,
      annualMax,
      annualPercentage,
      annualGrade,
      annualPosition: 0, // will be set below
    };
  });

  // Sort by annualTotal descending
  combined.sort((a, b) => b.annualTotal - a.annualTotal);

  // Assign positions (dense ranking)
  let pos = 1;
  combined.forEach((s, i) => {
    if (i > 0 && s.annualTotal !== (combined[i - 1]?.annualTotal ?? -1)) {
      pos = i + 1;
    }
    s.annualPosition = pos;
  });

  return combined;
}
