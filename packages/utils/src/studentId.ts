/**
 * Student ID format: SchoolAbbrev·AcadYearShort·SequentialNumber
 *
 * Examples:
 *   GSK·2526·0042   (Groupe Scolaire Kacyiru, year 2025-2026, student #42)
 *   KSS·2425·0006   (Kingdom of Salomon School, year 2024-2025, student #6)
 *
 * Registration number (official, numeric only, for Ministry reports):
 *   SchoolCode(3) + YearShort(4) + Sequential(4) = 11 digits
 *   e.g. "178252600006"  →  178 = school code, 2526 = year, 00006 = seq
 */

// ─── GENERATE STUDENT CODE ────────────────────────────────────────────────

/**
 * Generate the display student code shown on reports.
 * @param schoolAbbrev  e.g. "GSK"
 * @param academicYear  e.g. "2025-2026"
 * @param sequential    e.g. 42
 */
export function generateStudentCode(
  schoolAbbrev: string,
  academicYear: string,
  sequential: number
): string {
  const yearShort = getAcademicYearShort(academicYear); // "2526"
  const seqPadded = String(sequential).padStart(4, "0"); // "0042"
  return `${schoolAbbrev.toUpperCase()}·${yearShort}·${seqPadded}`;
}

/**
 * Generate the numeric registration number for Ministry reports.
 * @param schoolCode    3-digit school code e.g. "178"
 * @param academicYear  e.g. "2025-2026"
 * @param sequential    e.g. 6
 */
export function generateRegistrationNumber(
  schoolCode: string,
  academicYear: string,
  sequential: number
): string {
  const yearShort = getAcademicYearShort(academicYear); // "2526"
  const seqPadded = String(sequential).padStart(5, "0"); // "00006"
  return `${schoolCode.padStart(3, "0")}${yearShort}${seqPadded}`;
}

/**
 * Convert "2025-2026" → "2526"
 */
export function getAcademicYearShort(academicYear: string): string {
  const parts = academicYear.split("-");
  if (parts.length !== 2) return academicYear;
  const startYear = parts[0]!.slice(-2); // "25"
  const endYear   = parts[1]!.slice(-2); // "26"
  return `${startYear}${endYear}`;        // "2526"
}

/**
 * Get the current academic year string.
 * Rwanda academic year runs Jan–Dec, starts in January.
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
}

/**
 * Get the current term based on Rwanda's typical term dates.
 * Term 1: Jan–Mar   Term 2: Apr–Jun   Term 3: Aug–Nov
 * (principals can override in their school settings)
 */
export function getCurrentTerm(): 1 | 2 | 3 {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3)  return 1;
  if (month >= 4 && month <= 6)  return 2;
  return 3;
}

/**
 * Parse a student code back into its components.
 * "GSK·2526·0042" → { abbrev: "GSK", yearShort: "2526", sequential: 42 }
 */
export function parseStudentCode(code: string): {
  abbrev: string;
  yearShort: string;
  sequential: number;
} | null {
  const parts = code.split("·");
  if (parts.length !== 3) return null;
  return {
    abbrev:     parts[0]!,
    yearShort:  parts[1]!,
    sequential: parseInt(parts[2]!, 10),
  };
}

/**
 * Validate a student code format.
 */
export function isValidStudentCode(code: string): boolean {
  return /^[A-Z]{2,6}·\d{4}·\d{4}$/.test(code);
}
