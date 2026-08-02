import type { PennsylvaniaYearConfig } from "./types.js";

const K = 100;

/**
 * Pennsylvania rule configuration — tax year 2025.
 *
 * PA personal income tax is a flat rate on eight classes of income with no
 * standard deduction and no personal exemptions. Tax forgiveness (Schedule SP)
 * provides full or partial forgiveness at low eligibility incomes.
 *
 * Verify against the final 2025 PA-40 instruction booklet before a production
 * filing season — see docs/tax-rules/pennsylvania-2025.md.
 */
export const PENNSYLVANIA_2025: PennsylvaniaYearConfig = {
  taxYear: 2025,
  ruleVersion: "2025.1",
  sources: [
    "72 P.S. § 7302 (3.07% rate)",
    "2025 PA-40 instructions",
    "PA Schedule SP instructions (tax forgiveness)",
    "docs/tax-rules/pennsylvania-2025.md",
  ],

  taxRate: 0.0307,

  taxForgiveness: {
    baseClaimant: 6_500 * K,
    marriedAddition: 6_500 * K,
    perDependent: 9_500 * K,
    phaseoutStep: 250 * K,
    phaseoutStepPercentage: 0.1,
  },
};
