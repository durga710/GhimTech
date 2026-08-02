/**
 * The normalized tax return model.
 *
 * This is the single internal representation of a tax return. Everything —
 * intake, OCR verification, calculation engines, form rendering, and e-file
 * adapters — reads from and writes to this model. Provider- and form-specific
 * shapes are derived from it at the edges; they never leak into it.
 *
 * All monetary amounts are integer cents (see money.ts).
 */
import type {
  BankAccountType,
  DependentRelationship,
  FilingStatus,
  PaResidencyStatus,
} from "./enums.js";
import type { Cents } from "./money.js";

export interface PersonName {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  suffix?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Identity of a taxpayer or spouse. The SSN is carried here only as an opaque
 * reference (`ssnRef`) to an encrypted identity record plus its last four
 * digits for display. Full SSNs never travel through the return model.
 */
export interface TaxpayerIdentity {
  name: PersonName;
  ssnRef: string;
  ssnLast4: string;
  dateOfBirth: string; // ISO date
  occupation?: string;
  isBlind: boolean;
  /** Digital assets question on Form 1040. */
  hadDigitalAssets?: boolean;
}

export interface Dependent {
  name: PersonName;
  ssnRef: string;
  ssnLast4: string;
  dateOfBirth: string; // ISO date
  relationship: DependentRelationship;
  monthsLivedWithTaxpayer: number; // 0-12
  isStudent: boolean;
  isPermanentlyDisabled: boolean;
  /** Did the dependent provide more than half of their own support? */
  providedOwnSupport: boolean;
  /** Marked by preparer after applying qualifying-child / qualifying-relative tests. */
  qualifiesAsQualifyingChild: boolean;
  /** Eligible for Child Tax Credit (under 17 at year end, SSN valid for employment). */
  eligibleForChildTaxCredit: boolean;
  /** Eligible for Credit for Other Dependents. */
  eligibleForOtherDependentCredit: boolean;
  /** Qualifying person for EITC purposes. */
  eitcQualifyingChild: boolean;
  /** Qualifying person for Child and Dependent Care Credit. */
  qualifiesForDependentCare: boolean;
}

/** A W-2 as verified by a human after OCR. */
export interface W2Income {
  id: string;
  employerName: string;
  employerEin?: string;
  /** Box 1 wages. */
  wages: Cents;
  /** Box 2 federal income tax withheld. */
  federalWithholding: Cents;
  /** Box 3 social security wages. */
  socialSecurityWages: Cents;
  /** Box 5 Medicare wages. */
  medicareWages: Cents;
  /** Box 16 state wages (PA). */
  stateWages: Cents;
  /** Box 17 state income tax withheld (PA). */
  stateWithholding: Cents;
  /** State code from box 15, e.g. "PA". */
  stateCode?: string;
  /** Box 19 local income tax withheld. */
  localWithholding: Cents;
  /** Whether this W-2 belongs to the spouse on a joint return. */
  belongsToSpouse: boolean;
}

export interface InterestIncome {
  id: string;
  payerName: string;
  /** 1099-INT box 1 taxable interest. */
  taxableInterest: Cents;
  /** 1099-INT box 3 US savings bond / treasury interest (federally taxable, PA exempt). */
  usGovernmentInterest: Cents;
  /** 1099-INT box 8 tax-exempt interest. */
  taxExemptInterest: Cents;
  /** Box 4 federal withholding. */
  federalWithholding: Cents;
  belongsToSpouse: boolean;
}

export interface DividendIncome {
  id: string;
  payerName: string;
  /** 1099-DIV box 1a ordinary dividends. */
  ordinaryDividends: Cents;
  /** 1099-DIV box 1b qualified dividends. */
  qualifiedDividends: Cents;
  /** 1099-DIV box 2a total capital gain distributions. */
  capitalGainDistributions: Cents;
  /** Box 4 federal withholding. */
  federalWithholding: Cents;
  belongsToSpouse: boolean;
}

/** 1099-R retirement distribution. */
export interface RetirementIncome {
  id: string;
  payerName: string;
  /** Box 1 gross distribution. */
  grossDistribution: Cents;
  /** Box 2a taxable amount. */
  taxableAmount: Cents;
  /** Box 2b — taxable amount not determined. Requires preparer resolution. */
  taxableAmountNotDetermined: boolean;
  /** Box 4 federal withholding. */
  federalWithholding: Cents;
  /** Box 7 distribution code, e.g. "7" normal, "1" early. */
  distributionCode: string;
  /** IRA/SEP/SIMPLE checkbox. */
  isIra: boolean;
  /** Whether the plan is a PA-eligible employer plan paid after retirement age (PA exempt). */
  paEligiblePlan: boolean;
  /** Box 14 PA state withholding when present. */
  stateWithholding: Cents;
  belongsToSpouse: boolean;
}

/** SSA-1099 Social Security benefits. */
export interface SocialSecurityIncome {
  id: string;
  /** Box 5 net benefits. */
  netBenefits: Cents;
  /** Voluntary federal withholding. */
  federalWithholding: Cents;
  belongsToSpouse: boolean;
}

/** 1099-G unemployment compensation. */
export interface UnemploymentIncome {
  id: string;
  payerName: string;
  compensation: Cents;
  federalWithholding: Cents;
  belongsToSpouse: boolean;
}

/** Basic self-employment activity (Schedule C, cash-basis, no inventory/depreciation). */
export interface SelfEmploymentIncome {
  id: string;
  businessName: string;
  businessCode?: string;
  description: string;
  /** Gross receipts including amounts reported on 1099-NEC/MISC. */
  grossReceipts: Cents;
  /** Total ordinary and necessary expenses (categorized in intake, aggregated here). */
  totalExpenses: Cents;
  /** Expense breakdown for Schedule C categories, keys are category slugs. */
  expenseBreakdown?: Record<string, Cents>;
  /** Uses accrual accounting, inventory, depreciation, home office, or employees → unsupported. */
  requiresComplexSchedule: boolean;
  belongsToSpouse: boolean;
}

/** Itemized deduction inputs (Schedule A framework). */
export interface ItemizedDeductions {
  medicalExpenses: Cents;
  stateAndLocalIncomeTaxes: Cents;
  stateAndLocalRealEstateTaxes: Cents;
  stateAndLocalPersonalPropertyTaxes: Cents;
  homeMortgageInterest: Cents;
  /** Mortgage principal over the deduction limit requires manual handling. */
  mortgageOverLimit: boolean;
  charitableCash: Cents;
  charitableNonCash: Cents;
  /** Non-cash over $500 requires Form 8283 — currently unsupported. */
  otherDeductions: Cents;
}

export interface EducationExpense {
  id: string;
  studentName: string;
  /** Which dependent (or "TAXPAYER"/"SPOUSE") the expense belongs to. */
  studentRef: string;
  institutionName: string;
  /** Qualified tuition and related expenses (1098-T verified). */
  qualifiedExpenses: Cents;
  /** True → American Opportunity Credit path; false → Lifetime Learning. */
  eligibleForAotc: boolean;
  /** AOTC claimed for this student in 4 prior years disqualifies. */
  aotcClaimedFourPriorYears: boolean;
  /** At least half-time enrollment in a degree program (AOTC requirement). */
  atLeastHalfTime: boolean;
}

export interface DependentCareExpense {
  id: string;
  providerName: string;
  providerTin?: string;
  amountPaid: Cents;
  /** Refs of qualifying dependents this care was for. */
  dependentRefs: string[];
}

export interface EstimatedPayment {
  id: string;
  jurisdiction: "FEDERAL" | "PENNSYLVANIA";
  quarter: 1 | 2 | 3 | 4;
  datePaid: string; // ISO date
  amount: Cents;
}

export interface BankAccount {
  /** Opaque reference to the encrypted bank record. */
  accountRef: string;
  accountLast4: string;
  routingNumberValid: boolean;
  accountType: BankAccountType;
  bankName?: string;
}

export interface PennsylvaniaInfo {
  residencyStatus: PaResidencyStatus;
  /** For part-year residents: ISO dates of PA residency period. */
  residencyStartDate?: string;
  residencyEndDate?: string;
  schoolDistrict?: string;
  /** Political subdivision (PSD) code for local earned income tax. */
  psdCode?: string;
  /** Local EIT rate if known — informational capture only in this release. */
  localEitRate?: number;
  /** Taxpayer wants to claim PA tax forgiveness (Schedule SP) if eligible. */
  claimTaxForgiveness: boolean;
  /** Nontaxable income counted as eligibility income for Schedule SP. */
  spEligibilityOtherIncome: Cents;
}

/** Payments and refund preferences. */
export interface PaymentInfo {
  federalEstimatedPayments: EstimatedPayment[];
  paEstimatedPayments: EstimatedPayment[];
  /** Prior-year overpayment applied to this year. */
  federalOverpaymentApplied: Cents;
  paOverpaymentApplied: Cents;
  refundMethod: "DIRECT_DEPOSIT" | "CHECK";
  balanceDueMethod: "DIRECT_DEBIT" | "CHECK" | "IRS_DIRECT_PAY";
  bankAccount?: BankAccount;
}

/**
 * The complete normalized return. This is what the engines calculate from,
 * what reviewers approve, what clients sign, and what adapters translate.
 */
export interface TaxReturnModel {
  /** Stable identifier of the return this model belongs to. */
  returnId: string;
  taxYear: number;
  filingStatus: FilingStatus;
  taxpayer: TaxpayerIdentity;
  spouse?: TaxpayerIdentity;
  address: Address;
  dependents: Dependent[];

  /** Someone else can claim the taxpayer (or spouse) as a dependent. */
  taxpayerClaimedAsDependent: boolean;
  spouseClaimedAsDependent: boolean;

  w2s: W2Income[];
  interest: InterestIncome[];
  dividends: DividendIncome[];
  retirement: RetirementIncome[];
  socialSecurity: SocialSecurityIncome[];
  unemployment: UnemploymentIncome[];
  selfEmployment: SelfEmploymentIncome[];

  /** Deduction election. When undefined the engine picks the larger. */
  deductionElection?: "STANDARD" | "ITEMIZED";
  itemized?: ItemizedDeductions;

  educationExpenses: EducationExpense[];
  dependentCareExpenses: DependentCareExpense[];
  /** Earned income election / disqualifiers resolved during intake. */
  eitc: {
    claiming: boolean;
    /** Investment income, combat pay and other edge inputs resolved by preparer. */
    disqualified: boolean;
    disqualifiedReason?: string;
  };

  payments: PaymentInfo;
  pennsylvania?: PennsylvaniaInfo;

  /** Free-form flags a preparer sets that force diagnostics (e.g. amended return). */
  preparerFlags: string[];
}

/** Creates an empty return model for a new return. */
export function emptyReturnModel(params: {
  returnId: string;
  taxYear: number;
  filingStatus: FilingStatus;
  taxpayer: TaxpayerIdentity;
  address: Address;
}): TaxReturnModel {
  return {
    returnId: params.returnId,
    taxYear: params.taxYear,
    filingStatus: params.filingStatus,
    taxpayer: params.taxpayer,
    address: params.address,
    dependents: [],
    taxpayerClaimedAsDependent: false,
    spouseClaimedAsDependent: false,
    w2s: [],
    interest: [],
    dividends: [],
    retirement: [],
    socialSecurity: [],
    unemployment: [],
    selfEmployment: [],
    educationExpenses: [],
    dependentCareExpenses: [],
    eitc: { claiming: false, disqualified: false },
    payments: {
      federalEstimatedPayments: [],
      paEstimatedPayments: [],
      federalOverpaymentApplied: 0,
      paOverpaymentApplied: 0,
      refundMethod: "CHECK",
      balanceDueMethod: "CHECK",
    },
    preparerFlags: [],
  };
}
