/**
 * Inflation-adjusted and statutory figures for tax year 2025 (returns filed in
 * 2026).
 *
 * VERIFICATION NOTE — every figure in this file is a published-parameter copy,
 * not a derived value. Before this package is used to prepare a live return,
 * each constant must be reconciled line by line against the IRS source of
 * record (Rev. Proc. 2024-40, the Form 1040 instructions for 2025, and the
 * Social Security Administration's announced wage base), and the reconciliation
 * recorded in the release checklist. Diagnostics that depend on a threshold
 * cite the constant they used so a mismatch is traceable from the report.
 */
import { dollars, applyRate, type Money } from '../money.js';

/** The tax year this constant set describes. */
export const TAX_YEAR = 2025;

/** Last calendar day of the tax year, used for age and residency tests. */
export const TAX_YEAR_END = '2025-12-31';

/** First calendar day of the tax year. */
export const TAX_YEAR_START = '2025-01-01';

// ---------------------------------------------------------------------------
// FICA
// ---------------------------------------------------------------------------

/** Maximum wages subject to Social Security tax (SSA announced figure). */
export const SOCIAL_SECURITY_WAGE_BASE: Money = dollars(176_100);

/** Employee share of Social Security tax. */
export const SOCIAL_SECURITY_RATE = 0.062;

/** Employee share of Medicare tax. There is no Medicare wage ceiling. */
export const MEDICARE_RATE = 0.0145;

/** Additional Medicare Tax on wages above the filing-status threshold. */
export const ADDITIONAL_MEDICARE_RATE = 0.009;

/** Greatest Social Security tax any single employer may withhold. */
export const MAX_SOCIAL_SECURITY_TAX: Money = applyRate(
  SOCIAL_SECURITY_WAGE_BASE,
  SOCIAL_SECURITY_RATE,
);

// ---------------------------------------------------------------------------
// Standard deduction
// ---------------------------------------------------------------------------

/** Base standard deduction by filing status. */
export const STANDARD_DEDUCTION = {
  single: dollars(15_750),
  marriedFilingJointly: dollars(31_500),
  marriedFilingSeparately: dollars(15_750),
  headOfHousehold: dollars(23_625),
  qualifyingSurvivingSpouse: dollars(31_500),
} as const;

/** Additional standard deduction per qualifying age-65 or blindness box. */
export const ADDITIONAL_STANDARD_DEDUCTION = {
  unmarried: dollars(2_000),
  married: dollars(1_600),
} as const;

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

/** A child must be under this age at the close of the tax year to earn the CTC. */
export const CTC_MAX_AGE = 17;

/** Child Tax Credit per qualifying child. */
export const CTC_PER_CHILD: Money = dollars(2_200);

/** Refundable ceiling of the Additional Child Tax Credit per qualifying child. */
export const ACTC_REFUNDABLE_LIMIT: Money = dollars(1_700);

/** Credit for Other Dependents, for dependents who fail the CTC age or TIN test. */
export const OTHER_DEPENDENT_CREDIT: Money = dollars(500);

/** Disqualifying investment income ceiling for the Earned Income Credit. */
export const EITC_INVESTMENT_INCOME_LIMIT: Money = dollars(11_950);

/** Age band for an EIC claimant with no qualifying child. */
export const EITC_NO_CHILD_MIN_AGE = 25;
export const EITC_NO_CHILD_MAX_AGE = 64;

// ---------------------------------------------------------------------------
// Filing mechanics
// ---------------------------------------------------------------------------

/** Statutory due date for a calendar-year individual return. */
export const RETURN_DUE_DATE = '2026-04-15';

/** Length of a Self-Select or Practitioner PIN. */
export const PIN_LENGTH = 5;

/** Length of an Identity Protection PIN issued by the IRS. */
export const IP_PIN_LENGTH = 6;

/** Length of an Electronic Filing Identification Number. */
export const EFIN_LENGTH = 6;

/**
 * Tolerance applied when reconciling a withheld amount against its statutory
 * rate. Employers round each pay period independently, so a small cumulative
 * drift is expected and is not a defect.
 */
export const WITHHOLDING_TOLERANCE: Money = dollars(2);
