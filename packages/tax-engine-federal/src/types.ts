/**
 * The Federal Form 1040 domain model.
 *
 * This is the shape a preparer's data entry produces and the shape both the
 * calculation engine and the diagnostics engine consume. It models the return
 * as it was *entered* — source documents and elections — and keeps every
 * derived figure in {@link ComputedTotals}. Diagnostics can therefore run on a
 * half-finished return, before any calculation has happened, which is exactly
 * when a preparer most wants to see them.
 */
import type { Money } from './money.js';
import type { IsoDate } from './dates.js';

export type { IsoDate } from './dates.js';

/** Form 1040 filing status checkboxes. */
export type FilingStatus =
  | 'single'
  | 'marriedFilingJointly'
  | 'marriedFilingSeparately'
  | 'headOfHousehold'
  | 'qualifyingSurvivingSpouse';

/** Which spouse a source document belongs to on a joint return. */
export type Filer = 'taxpayer' | 'spouse';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  /** Two-letter state, territory or military post code. Omitted when foreign. */
  state?: string;
  /** ZIP or ZIP+4. Omitted when foreign. */
  zip?: string;
  /** Present only for a foreign address. */
  foreignCountry?: string;
  foreignProvince?: string;
  foreignPostalCode?: string;
}

export interface Person {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  suffix?: string;
  /** SSN, ITIN or ATIN, digits only or hyphenated. */
  tin: string;
  dateOfBirth: IsoDate;
  dateOfDeath?: IsoDate;
  isBlind?: boolean;
  occupation?: string;
  /** Six-digit Identity Protection PIN, when the IRS has issued one. */
  identityProtectionPin?: string;
}

export type DependentRelationship =
  | 'son'
  | 'daughter'
  | 'stepchild'
  | 'fosterChild'
  | 'grandchild'
  | 'brother'
  | 'sister'
  | 'halfBrother'
  | 'halfSister'
  | 'stepbrother'
  | 'stepsister'
  | 'nephew'
  | 'niece'
  | 'parent'
  | 'grandparent'
  | 'aunt'
  | 'uncle'
  | 'inLaw'
  | 'other';

/** Why a dependent lived with the taxpayer for fewer than twelve months. */
export type AbsenceReason =
  | 'birthOrDeath'
  | 'temporaryAbsence'
  | 'divorceOrSeparation'
  | 'kidnapping';

export interface Dependent extends Person {
  relationship: DependentRelationship;
  /** Whole months the dependent lived in the taxpayer's home, 0 through 12. */
  monthsLivedWithTaxpayer: number;
  absenceReason?: AbsenceReason;
  isFullTimeStudent?: boolean;
  isPermanentlyDisabled?: boolean;
  /** Preparer's election to claim the Child Tax Credit for this dependent. */
  claimedForChildTaxCredit?: boolean;
  /** Preparer's election to claim the Credit for Other Dependents. */
  claimedForOtherDependentCredit?: boolean;
  /** Treated as a qualifying child for the Earned Income Credit. */
  qualifiesForEarnedIncomeCredit?: boolean;
  /** Designated as the qualifying person supporting head-of-household status. */
  isQualifyingPersonForHeadOfHousehold?: boolean;
}

// ---------------------------------------------------------------------------
// Source documents
// ---------------------------------------------------------------------------

/** A single Box 12 entry: a one or two letter code and its amount. */
export interface W2Box12Entry {
  code: string;
  amount: Money;
}

export interface W2StateEntry {
  state: string;
  employerStateIdNumber?: string;
  stateWages: Money;
  stateIncomeTax: Money;
  localityName?: string;
  localWages?: Money;
  localIncomeTax?: Money;
}

export interface FormW2 {
  /** Stable key for referring to this document in a diagnostic. */
  id?: string;
  belongsTo: Filer;
  employerEin: string;
  employerName: string;
  employerAddress?: Address;
  /** Box 1 — wages, tips, other compensation. */
  wages: Money;
  /** Box 2 — federal income tax withheld. */
  federalIncomeTaxWithheld: Money;
  /** Box 3 — Social Security wages. */
  socialSecurityWages: Money;
  /** Box 4 — Social Security tax withheld. */
  socialSecurityTaxWithheld: Money;
  /** Box 5 — Medicare wages and tips. */
  medicareWages: Money;
  /** Box 6 — Medicare tax withheld. */
  medicareTaxWithheld: Money;
  /** Box 7 — Social Security tips. */
  socialSecurityTips?: Money;
  /** Box 8 — allocated tips. */
  allocatedTips?: Money;
  /** Box 10 — dependent care benefits. */
  dependentCareBenefits?: Money;
  /** Box 11 — nonqualified plans. */
  nonqualifiedPlans?: Money;
  box12?: W2Box12Entry[];
  /** Box 13 checkboxes. */
  statutoryEmployee?: boolean;
  retirementPlan?: boolean;
  thirdPartySickPay?: boolean;
  /** Box 14 — free-form employer entries. */
  other?: string;
  stateEntries?: W2StateEntry[];
}

interface PayerDocument {
  id?: string;
  belongsTo: Filer;
  payerName: string;
  payerTin?: string;
  federalIncomeTaxWithheld?: Money;
}

export interface Form1099Int extends PayerDocument {
  interestIncome: Money;
  earlyWithdrawalPenalty?: Money;
  usSavingsBondInterest?: Money;
  taxExemptInterest?: Money;
  privateActivityBondInterest?: Money;
}

export interface Form1099Div extends PayerDocument {
  ordinaryDividends: Money;
  qualifiedDividends?: Money;
  capitalGainDistributions?: Money;
  section199ADividends?: Money;
  exemptInterestDividends?: Money;
}

export interface Form1099R extends PayerDocument {
  grossDistribution: Money;
  taxableAmount?: Money;
  taxableAmountNotDetermined?: boolean;
  totalDistribution?: boolean;
  /** Box 7 distribution code(s), e.g. `'7'`, `'1B'`. */
  distributionCode: string;
  iraSepSimple?: boolean;
}

export interface Form1099Nec extends PayerDocument {
  nonemployeeCompensation: Money;
}

export interface Form1099G extends PayerDocument {
  unemploymentCompensation?: Money;
  stateOrLocalRefund?: Money;
}

export interface OtherIncomeItem {
  description: string;
  amount: Money;
}

export interface IncomeSources {
  w2s: FormW2[];
  form1099Int?: Form1099Int[];
  form1099Div?: Form1099Div[];
  form1099R?: Form1099R[];
  form1099Nec?: Form1099Nec[];
  form1099G?: Form1099G[];
  otherIncome?: OtherIncomeItem[];
}

// ---------------------------------------------------------------------------
// Deductions, credits, payments
// ---------------------------------------------------------------------------

export type DeductionMethod = 'standard' | 'itemized';

export interface ItemizedDeductions {
  medicalAndDental?: Money;
  stateAndLocalIncomeOrSalesTax?: Money;
  realEstateTaxes?: Money;
  personalPropertyTaxes?: Money;
  homeMortgageInterest?: Money;
  investmentInterest?: Money;
  charitableCash?: Money;
  charitableNonCash?: Money;
  casualtyAndTheftLosses?: Money;
  otherItemized?: Money;
}

export interface Deduction {
  method: DeductionMethod;
  itemized?: ItemizedDeductions;
}

export type EducationCredit = 'americanOpportunity' | 'lifetimeLearning' | 'none';

export interface CreditElections {
  earnedIncomeCredit?: boolean;
  /**
   * A separated spouse living apart may claim the EIC while filing separately
   * (IRC 32(d)(2)). Without this election, MFS is disqualifying.
   */
  eicSeparatedSpouseElection?: boolean;
  childAndDependentCareCredit?: boolean;
  educationCredit?: EducationCredit;
  retirementSavingsContributionsCredit?: boolean;
  premiumTaxCredit?: boolean;
}

export interface Payments {
  estimatedTaxPayments?: Money;
  priorYearOverpaymentApplied?: Money;
  extensionPayment?: Money;
  /** Withholding reported outside the itemised source documents above. */
  otherFederalWithholding?: Money;
}

// ---------------------------------------------------------------------------
// Refund, balance due, signature
// ---------------------------------------------------------------------------

export type BankAccountType = 'checking' | 'savings';

export interface BankAccount {
  routingNumber: string;
  accountNumber: string;
  accountType: BankAccountType;
}

export type RefundMethod = 'directDeposit' | 'paperCheck' | 'applyToNextYear';

export interface RefundElection {
  method: RefundMethod;
  account?: BankAccount;
  amountAppliedToNextYear?: Money;
}

export type PaymentMethod = 'directDebit' | 'checkOrMoneyOrder' | 'eftps' | 'creditCard' | 'none';

export interface BalanceDueElection {
  method: PaymentMethod;
  account?: BankAccount;
  amount?: Money;
  requestedPaymentDate?: IsoDate;
}

export type SignatureMethod = 'selfSelectPin' | 'practitionerPin';

export interface EFileSignature {
  method: SignatureMethod;
  /** Five digits chosen by the taxpayer. */
  taxpayerPin: string;
  spousePin?: string;
  /** Prior-year AGI, the shared secret that authenticates a Self-Select PIN. */
  taxpayerPriorYearAgi?: Money;
  spousePriorYearAgi?: Money;
  taxpayerPriorYearPin?: string;
  spousePriorYearPin?: string;
  signatureDate: IsoDate;
  spouseSignatureDate?: IsoDate;
}

export interface Preparer {
  name: string;
  /** Preparer Tax Identification Number, `P` followed by eight digits. */
  ptin: string;
  firmName?: string;
  firmEin?: string;
  /** Six-digit Electronic Filing Identification Number. */
  efin?: string;
  phone?: string;
  isSelfEmployed?: boolean;
}

export interface ThirdPartyDesignee {
  allow: boolean;
  name?: string;
  phone?: string;
  /** Five-digit personal identification number chosen for the designee. */
  pin?: string;
}

// ---------------------------------------------------------------------------
// The return
// ---------------------------------------------------------------------------

export interface FederalReturn {
  taxYear: number;
  filingStatus: FilingStatus;
  taxpayer: Person;
  spouse?: Person;
  address: Address;
  dependents: Dependent[];
  /** Someone else can claim the taxpayer as a dependent. */
  taxpayerClaimedAsDependent?: boolean;
  spouseClaimedAsDependent?: boolean;
  spouseIsNonresidentAlien?: boolean;
  /** Supports head-of-household and the separated-spouse EIC election. */
  livedApartFromSpouseLastSixMonths?: boolean;
  /**
   * Date of death of the spouse whose death supports qualifying surviving
   * spouse status. That status is available for the two years *following* the
   * year of death, so this is a prior-year date and no spouse record is
   * attached to the return.
   */
  deceasedSpouseDateOfDeath?: IsoDate;
  income: IncomeSources;
  deduction: Deduction;
  credits?: CreditElections;
  payments?: Payments;
  refund?: RefundElection;
  balanceDue?: BalanceDueElection;
  signature?: EFileSignature;
  preparer?: Preparer;
  thirdPartyDesignee?: ThirdPartyDesignee;
  presidentialElectionFund?: { taxpayer: boolean; spouse?: boolean };
  digitalAssetTransactions?: boolean;
  isAmended?: boolean;
  filingMethod?: 'efile' | 'paper';
}

/**
 * Figures produced by the calculation engine. Supplied to diagnostics when
 * available so that cross-total rules can fire; every field is optional because
 * diagnostics must also run before any calculation has taken place.
 */
export interface ComputedTotals {
  totalWages?: Money;
  taxableInterest?: Money;
  taxExemptInterest?: Money;
  ordinaryDividends?: Money;
  qualifiedDividends?: Money;
  /** Investment income as defined for the Earned Income Credit test. */
  investmentIncome?: Money;
  earnedIncome?: Money;
  totalIncome?: Money;
  adjustedGrossIncome?: Money;
  deductionAmount?: Money;
  taxableIncome?: Money;
  totalTax?: Money;
  totalFederalWithholding?: Money;
  totalPayments?: Money;
  refundAmount?: Money;
  amountOwed?: Money;
}
