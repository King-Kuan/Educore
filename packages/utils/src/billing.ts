import type { PlanType } from "@educore/types";

// ─── PRICING CONSTANTS ────────────────────────────────────────────────────

export const FLAT_RATE_LIMIT   = 300;         // students
export const FLAT_RATE_AMOUNT  = 170_000;     // Rwf per year
export const PER_STUDENT_RATE  = 700;         // Rwf per student per year

// ─── BILLING CALCULATION ─────────────────────────────────────────────────

/**
 * Calculate annual fee for a school.
 *
 * Rules:
 *   ≤ 300 students → flat 170,000 Rwf
 *   > 300 students → 700 Rwf × student count
 *
 * @param studentCount  Current enrolled student count
 * @returns Amount in Rwf and plan type used
 */
export function calculateAnnualFee(studentCount: number): {
  amountRwf: number;
  planType: PlanType;
  breakdown: string;
} {
  if (studentCount <= FLAT_RATE_LIMIT) {
    return {
      amountRwf: FLAT_RATE_AMOUNT,
      planType:  "flat",
      breakdown: `Flat rate for up to ${FLAT_RATE_LIMIT} students`,
    };
  }

  const amount = studentCount * PER_STUDENT_RATE;
  return {
    amountRwf: amount,
    planType:  "per_student",
    breakdown: `${studentCount} students × ${PER_STUDENT_RATE.toLocaleString()} Rwf`,
  };
}

/**
 * Format an amount in Rwf for display.
 * e.g. 170000 → "170,000 Rwf"
 */
export function formatRwf(amount: number): string {
  return `${amount.toLocaleString("en-RW")} Rwf`;
}

/**
 * Get due date for subscription: 31 January of the current academic year.
 */
export function getSubscriptionDueDate(academicYear: string): Date {
  const startYear = parseInt(academicYear.split("-")[0]!, 10);
  return new Date(startYear, 0, 31); // January 31
}

/**
 * Check if a subscription is overdue.
 */
export function isSubscriptionOverdue(dueDate: Date): boolean {
  return new Date() > dueDate;
}

/**
 * Get days until subscription expires.
 * Negative = already expired.
 */
export function daysUntilExpiry(expiryDate: Date): number {
  const diff = expiryDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
