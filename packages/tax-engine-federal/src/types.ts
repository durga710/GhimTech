import type { CalculationTrace, Cents, Diagnostic } from "@ghimtech/tax-domain";

/** Complete result of a federal calculation run. All values are whole-dollar cents. */
export interface FederalCalculationResult {
  taxYear: number;
  ruleVersion: string;

  // Income
  wages: Cents;
  taxExemptInterest: Cents;
  taxableInterest: Cents;
  qualifiedDividends: Cents;
  ordinaryDividends: Cents;
  retirementGross: Cents;
  retirementTaxable: Cents;
  socialSecurityBenefits: Cents;
  socialSecurityTaxable: Cents;
  capitalGainDistributions: Cents;
  unemploymentCompensation: Cents;
  businessNetProfit: Cents;
  totalIncome: Cents;

  // Adjustments and AGI
  seTaxDeduction: Cents;
  totalAdjustments: Cents;
  adjustedGrossIncome: Cents;

  // Deductions
  deductionTaken: "STANDARD" | "ITEMIZED";
  standardDeduction: Cents;
  itemizedDeduction: Cents;
  deduction: Cents;
  qbiDeduction: Cents;
  taxableIncome: Cents;

  // Tax
  incomeTax: Cents;
  selfEmploymentTax: Cents;
  additionalMedicareTax: Cents;
  netInvestmentIncomeTax: Cents;
  earlyDistributionTax: Cents;
  totalTaxBeforeCredits: Cents;

  // Credits
  childTaxCredit: Cents;
  otherDependentCredit: Cents;
  additionalChildTaxCredit: Cents;
  dependentCareCredit: Cents;
  educationCreditsNonrefundable: Cents;
  aotcRefundable: Cents;
  earnedIncomeCredit: Cents;
  totalNonrefundableCredits: Cents;

  totalTax: Cents;

  // Payments
  federalWithholding: Cents;
  estimatedPayments: Cents;
  totalPayments: Cents;

  // Bottom line
  refund: Cents;
  balanceDue: Cents;

  earnedIncome: Cents;
  qualifyingChildrenCount: number;
  otherDependentsCount: number;

  diagnostics: Diagnostic[];
  trace: CalculationTrace;
}
