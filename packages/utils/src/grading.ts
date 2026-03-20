import type {
  LetterGrade,
  DescriptorGrade,
  GradingResult,
  GradingType,
} from "@educore/types";

// ─── RWANDA MINISTRY OF EDUCATION — 7-GRADE SCALE ────────────────────────

export const GRADE_SCALE: {
  grade: LetterGrade;
  minPct: number;
  maxPct: number;
  descriptor: string;
  value: number; // numeric value for sorting/comparison
}[] = [
  { grade: "A", minPct: 80,  maxPct: 100, descriptor: "Excellent",    value: 6 },
  { grade: "B", minPct: 75,  maxPct: 79,  descriptor: "Very Good",    value: 5 },
  { grade: "C", minPct: 70,  maxPct: 74,  descriptor: "Good",         value: 4 },
  { grade: "D", minPct: 65,  maxPct: 69,  descriptor: "Satisfactory", value: 3 },
  { grade: "E", minPct: 60,  maxPct: 64,  descriptor: "Adequate",     value: 2 },
  { grade: "S", minPct: 50,  maxPct: 59,  descriptor: "Min. Pass",    value: 1 },
  { grade: "F", minPct: 0,   maxPct: 49,  descriptor: "Fail",         value: 0 },
];

// ─── NURSERY DESCRIPTOR SCALE ─────────────────────────────────────────────

export const NURSERY_SCALE: {
  descriptor: DescriptorGrade;
  minPct: number;
  maxPct: number;
}[] = [
  { descriptor: "Excellent",    minPct: 80,  maxPct: 100 },
  { descriptor: "Very Good",    minPct: 65,  maxPct: 79  },
  { descriptor: "Good",         minPct: 50,  maxPct: 64  },
  { descriptor: "Satisfactory", minPct: 0,   maxPct: 49  },
];

// ─── CORE GRADING FUNCTION ────────────────────────────────────────────────

/**
 * Calculate grade from a raw score and max marks.
 * Works for any subject regardless of max (20, 40, 80, 100…).
 * Grade is always determined from percentage, not raw score.
 */
export function calculateGrade(
  score: number,
  maxMarks: number,
  gradingType: GradingType = "percentage"
): GradingResult {
  if (maxMarks <= 0) throw new Error("maxMarks must be greater than 0");
  if (score < 0) score = 0;
  if (score > maxMarks) score = maxMarks;

  const percentage = parseFloat(((score / maxMarks) * 100).toFixed(2));

  if (gradingType === "descriptors") {
    return calculateDescriptorGrade(percentage);
  }

  const found = GRADE_SCALE.find(
    (g) => percentage >= g.minPct && percentage <= g.maxPct
  );
  const entry = found ?? GRADE_SCALE[GRADE_SCALE.length - 1]!;

  return {
    grade: entry.grade,
    descriptor: entry.descriptor,
    percentage,
    passed: percentage >= 50,
    value: entry.value,
  };
}

/**
 * Calculate descriptor grade for nursery levels.
 * Returns no numeric score — only the descriptor.
 */
export function calculateDescriptorGrade(percentage: number): GradingResult {
  const found = NURSERY_SCALE.find(
    (g) => percentage >= g.minPct && percentage <= g.maxPct
  );
  const entry = found ?? NURSERY_SCALE[NURSERY_SCALE.length - 1]!;

  // Map descriptor to letter for internal use (not shown on nursery reports)
  const letterMap: Record<DescriptorGrade, LetterGrade> = {
    Excellent:    "A",
    "Very Good":  "B",
    Good:         "C",
    Satisfactory: "S",
  };

  const gradeValue: Record<DescriptorGrade, number> = {
    Excellent:    6,
    "Very Good":  5,
    Good:         4,
    Satisfactory: 1,
  };

  return {
    grade: letterMap[entry.descriptor],
    descriptor: entry.descriptor,
    percentage,
    passed: true, // Nursery students are never failed
    value: gradeValue[entry.descriptor],
  };
}

/**
 * Calculate grade for conduct (always out of 40, no exam split).
 */
export function calculateConductGrade(score: number): GradingResult {
  return calculateGrade(score, 40);
}

/**
 * Given CA score + exam score + their respective maxes,
 * return the combined total and grade.
 */
export function calculateCombinedGrade(
  caScore: number | null,
  caMax: number,
  examScore: number | null,
  examMax: number,
  gradingType: GradingType = "percentage"
): {
  caScore: number;
  examScore: number;
  totalScore: number;
  totalMax: number;
  result: GradingResult;
} {
  const ca   = caScore   ?? 0;
  const exam = examScore ?? 0;
  const total    = ca + exam;
  const totalMax = caMax + examMax;

  return {
    caScore:    ca,
    examScore:  exam,
    totalScore: total,
    totalMax,
    result: calculateGrade(total, totalMax, gradingType),
  };
}

/**
 * Get grade from letter string (for display lookups).
 */
export function getGradeInfo(grade: LetterGrade) {
  return GRADE_SCALE.find((g) => g.grade === grade) ?? GRADE_SCALE[GRADE_SCALE.length - 1]!;
}

/**
 * Get grade badge color classes (for UI).
 */
export function getGradeBadgeClass(grade: LetterGrade): string {
  const map: Record<LetterGrade, string> = {
    A: "grade-a",
    B: "grade-b",
    C: "grade-c",
    D: "grade-d",
    E: "grade-e",
    S: "grade-s",
    F: "grade-f",
  };
  return map[grade];
}

/**
 * Determine promotion / decision based on annual percentage.
 * Rwanda standard: >= 50% = promoted, 40-49% = second sitting, < 40% = repeat
 */
export function determineDecision(annualPercentage: number): {
  firstDecision: "promoted" | "second_sitting" | "repeat";
  descriptor: string;
} {
  if (annualPercentage >= 50) {
    return { firstDecision: "promoted",       descriptor: "Promoted"       };
  } else if (annualPercentage >= 40) {
    return { firstDecision: "second_sitting", descriptor: "2nd Sitting"    };
  } else {
    return { firstDecision: "repeat",         descriptor: "Advised to Repeat" };
  }
}
