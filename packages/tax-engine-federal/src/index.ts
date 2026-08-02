/**
 * The public surface of the federal tax engine.
 *
 * Everything a consumer needs is named here explicitly rather than re-exported
 * wholesale. That is deliberate: the moment a package exports `*` from its
 * internals, every private helper becomes part of the contract by accident, and
 * an application ends up depending on something that was only ever meant to
 * serve one rule file. Adding a name here should be a decision, not a side
 * effect of writing a function.
 */

// The engine.
export { runDiagnostics, summarizeDiagnostics } from './diagnostics.js';

// The diagnostics vocabulary — severities, findings, rules, reports, options.
export {
  SEVERITY_RANK,
  blocksElectronicFiling,
  type Diagnostic,
  type DiagnosticContext,
  type DiagnosticFinding,
  type DiagnosticReport,
  type DiagnosticRule,
  type DiagnosticSeverity,
  type RunDiagnosticsOptions,
} from './diagnostics/types.js';

// The rule registry, for a rule-listing or suppression screen.
export { FEDERAL_DIAGNOSTIC_RULES, getRuleByCode } from './diagnostics/registry.js';

// The domain model.
export type {
  AbsenceReason,
  Address,
  BalanceDueElection,
  BankAccount,
  BankAccountType,
  ComputedTotals,
  CreditElections,
  Deduction,
  DeductionMethod,
  Dependent,
  DependentRelationship,
  EducationCredit,
  EFileSignature,
  FederalReturn,
  Filer,
  FilingStatus,
  Form1099Div,
  Form1099G,
  Form1099Int,
  Form1099Nec,
  Form1099R,
  FormW2,
  IncomeSources,
  ItemizedDeductions,
  OtherIncomeItem,
  PaymentMethod,
  Payments,
  Person,
  Preparer,
  RefundElection,
  RefundMethod,
  SignatureMethod,
  ThirdPartyDesignee,
  W2Box12Entry,
  W2StateEntry,
} from './types.js';

// Monetary amounts: integer cents, never floating point dollars.
export {
  applyRate,
  difference,
  dollars,
  formatMoney,
  isValidMoney,
  sumMoney,
  toDollars,
  type Money,
} from './money.js';

// Calendar dates: plain `YYYY-MM-DD` strings, never instants.
export {
  ageForYearEndTest,
  ageOn,
  compareIsoDates,
  daysInMonth,
  isAfter,
  isIsoDate,
  isLeapYear,
  isOnOrBefore,
  parseIsoDate,
  yearOf,
  type DateParts,
  type IsoDate,
} from './dates.js';

// Identifier validation: TINs, EINs, bank details, postal and PIN formats.
export {
  US_STATE_CODES,
  classifyTin,
  formatEin,
  formatTin,
  isDirectDepositRoutingNumber,
  isEmploymentAuthorizedTin,
  isValidAtin,
  isValidBankAccountNumber,
  isValidEin,
  isValidItin,
  isValidPin,
  isValidRoutingNumber,
  isValidSsn,
  isValidStateCode,
  isValidTin,
  isValidZipCode,
  maskTin,
  normalizeTin,
  type TinKind,
} from './identifiers.js';
