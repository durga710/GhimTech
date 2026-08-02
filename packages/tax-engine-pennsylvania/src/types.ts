import type { CalculationTrace, Cents, Diagnostic } from "@ghimtech/tax-domain";

/**
 * Result of a PA-40 calculation. PA taxes eight classes of income at a flat
 * rate; losses in one class cannot offset another. This release supports the
 * compensation, interest, dividend, and business-income classes; capital-gain
 * class exists architecturally and is blocked by diagnostics until Schedule D
 * support lands.
 */
export interface PaCalculationResult {
  taxYear: number;
  ruleVersion: string;

  compensation: Cents;
  interest: Cents;
  dividends: Cents;
  businessIncome: Cents;
  /** Architecture present; always 0 until PA Schedule D is supported. */
  netGains: Cents;
  totalTaxableIncome: Cents;

  taxLiability: Cents;

  /** Schedule SP tax forgiveness. */
  eligibilityIncome: Cents;
  forgivenessPercentage: number; // 0..1 in 10% steps
  taxForgiveness: Cents;

  taxAfterForgiveness: Cents;

  withholding: Cents;
  estimatedPayments: Cents;
  totalPayments: Cents;

  refund: Cents;
  balanceDue: Cents;

  diagnostics: Diagnostic[];
  trace: CalculationTrace;
}
