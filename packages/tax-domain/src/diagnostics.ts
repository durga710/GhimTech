/**
 * Diagnostics: the mechanism that keeps unsupported or inconsistent returns
 * from being filed. ERROR-severity diagnostics block e-filing; WARNING requires
 * preparer acknowledgment; INFO is advisory.
 */

export type DiagnosticSeverity = "ERROR" | "WARNING" | "INFO";

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  /** JSON pointer-ish path into the return model, e.g. "/w2s/0/wages". */
  path?: string;
  /** Which jurisdiction raised it. */
  jurisdiction: "FEDERAL" | "PENNSYLVANIA" | "PLATFORM";
}

export function blockingDiagnostics(diags: Diagnostic[]): Diagnostic[] {
  return diags.filter((d) => d.severity === "ERROR");
}

export function hasBlockingDiagnostics(diags: Diagnostic[]): boolean {
  return diags.some((d) => d.severity === "ERROR");
}

/** Well-known diagnostic codes used across the platform. */
export const DiagnosticCodes = {
  // Identity / structural
  MISSING_TIN: "MISSING_TIN",
  MISSING_SPOUSE: "MISSING_SPOUSE",
  SPOUSE_NOT_ALLOWED: "SPOUSE_NOT_ALLOWED",
  FILING_STATUS_INCONSISTENT: "FILING_STATUS_INCONSISTENT",
  DEPENDENT_CONFLICT: "DEPENDENT_CONFLICT",
  HOH_NO_QUALIFYING_PERSON: "HOH_NO_QUALIFYING_PERSON",

  // Income
  W2_WITHHOLDING_SUSPICIOUS: "W2_WITHHOLDING_SUSPICIOUS",
  RETIREMENT_TAXABLE_UNRESOLVED: "RETIREMENT_TAXABLE_UNRESOLVED",
  SCHEDULE_B_REQUIRED: "SCHEDULE_B_REQUIRED",

  // Unsupported situations — always blocking
  UNSUPPORTED_SITUATION: "UNSUPPORTED_SITUATION",
  UNSUPPORTED_COMPLEX_SCHEDULE_C: "UNSUPPORTED_COMPLEX_SCHEDULE_C",
  UNSUPPORTED_QBI_OVER_THRESHOLD: "UNSUPPORTED_QBI_OVER_THRESHOLD",
  UNSUPPORTED_ITEMIZED_COMPONENT: "UNSUPPORTED_ITEMIZED_COMPONENT",
  UNSUPPORTED_PA_RESIDENCY: "UNSUPPORTED_PA_RESIDENCY",

  // Credits
  EITC_INVESTMENT_INCOME_LIMIT: "EITC_INVESTMENT_INCOME_LIMIT",
  EITC_DISQUALIFIED: "EITC_DISQUALIFIED",
  AOTC_PRIOR_YEARS_EXHAUSTED: "AOTC_PRIOR_YEARS_EXHAUSTED",
  DEPENDENT_CARE_NO_EARNED_INCOME: "DEPENDENT_CARE_NO_EARNED_INCOME",

  // Health insurance
  MISSING_1095A_RECONCILIATION: "MISSING_1095A_RECONCILIATION",

  // Payments / banking
  BANK_ROUTING_INVALID: "BANK_ROUTING_INVALID",
  DIRECT_DEPOSIT_MISSING_BANK: "DIRECT_DEPOSIT_MISSING_BANK",

  // Pennsylvania
  PA_RESIDENCY_CONFLICT: "PA_RESIDENCY_CONFLICT",
  PA_LOCAL_TAX_INFO_MISSING: "PA_LOCAL_TAX_INFO_MISSING",
  PA_W2_STATE_MISMATCH: "PA_W2_STATE_MISMATCH",

  // Filing
  MISSING_SIGNATURE: "MISSING_SIGNATURE",
  SIGNATURE_INVALIDATED: "SIGNATURE_INVALIDATED",
  PROVIDER_VALIDATION_FAILED: "PROVIDER_VALIDATION_FAILED",
} as const;

export type DiagnosticCode = (typeof DiagnosticCodes)[keyof typeof DiagnosticCodes];
