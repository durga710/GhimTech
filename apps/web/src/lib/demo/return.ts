/**
 * The sample return the workspace is demonstrated against.
 *
 * SAMPLE DATA. Every person, employer, identifier and figure below is invented.
 * Taxpayer identification numbers are drawn from the 4xx-xx-xxxx range and
 * belong to nobody; bank details are placeholders. Nothing here is a real
 * return, and no screen in this product renders a full identification number
 * even for this synthetic data — {@link maskedTin} is the only accessor.
 *
 * The return carries a handful of deliberate defects so that the diagnostics
 * panel shows genuine engine output rather than a hand-written list. Those
 * defects are the ordinary ones: an employer identification number keyed from a
 * blurred copy, a Social Security box transposed, a child who turned seventeen
 * during the year and is still flagged for the Child Tax Credit, a foster child
 * who moved in halfway through, and a joint return missing one of its two
 * prior-year shared secrets.
 */
import {
  dollars,
  formatMoney,
  maskTin,
  runDiagnostics,
  summarizeDiagnostics,
  type ComputedTotals,
  type Diagnostic,
  type DiagnosticReport,
  type DiagnosticSeverity,
  type FederalReturn,
  type FilingStatus,
  type Money,
} from '@ghimtech-tax/tax-engine-federal';

/**
 * The date every diagnostic run in this application is evaluated against.
 *
 * Fixed rather than taken from the clock: a demonstration whose report changes
 * shape depending on the day it is opened is not a demonstration, and a server
 * and client that disagree about "today" produce a hydration mismatch.
 */
export const SAMPLE_AS_OF_DATE = '2026-02-17';

/** Human form of {@link SAMPLE_AS_OF_DATE}, for prose. */
export const SAMPLE_AS_OF_LABEL = '17 February 2026';

export const SAMPLE_TAX_YEAR = 2025;

// ---------------------------------------------------------------------------
// The return
// ---------------------------------------------------------------------------

export const sampleReturn: FederalReturn = {
  taxYear: SAMPLE_TAX_YEAR,
  filingStatus: 'marriedFilingJointly',
  taxpayer: {
    firstName: 'Marcus',
    middleInitial: 'D',
    lastName: 'Ellery',
    tin: '412-88-4417',
    dateOfBirth: '1982-05-09',
    occupation: 'Respiratory therapist',
  },
  spouse: {
    firstName: 'Nadia',
    middleInitial: 'P',
    lastName: 'Ellery',
    tin: '429-71-3306',
    dateOfBirth: '1984-11-23',
    occupation: 'Mechanical engineer',
  },
  address: {
    line1: '1428 Bellefield Avenue',
    line2: 'Apartment 3C',
    city: 'Pittsburgh',
    state: 'PA',
    zip: '15213',
  },
  dependents: [
    {
      firstName: 'Elena',
      lastName: 'Ellery',
      tin: '447-52-9081',
      dateOfBirth: '2008-03-14',
      relationship: 'daughter',
      monthsLivedWithTaxpayer: 12,
      isFullTimeStudent: true,
      claimedForChildTaxCredit: true,
    },
    {
      firstName: 'Theo',
      lastName: 'Ellery',
      tin: '451-63-2274',
      dateOfBirth: '2014-09-02',
      relationship: 'son',
      monthsLivedWithTaxpayer: 12,
      claimedForChildTaxCredit: true,
    },
    {
      firstName: 'Samuel',
      lastName: 'Boyd',
      tin: '465-90-1188',
      dateOfBirth: '2011-06-21',
      relationship: 'fosterChild',
      monthsLivedWithTaxpayer: 5,
      claimedForOtherDependentCredit: true,
    },
  ],
  income: {
    w2s: [
      {
        id: 'w2-ahn',
        belongsTo: 'taxpayer',
        employerName: 'Allegheny Vista Health Partners',
        employerEin: '25-1234563',
        employerAddress: {
          line1: '900 Liberty Avenue',
          city: 'Pittsburgh',
          state: 'PA',
          zip: '15222',
        },
        wages: dollars(82_400),
        federalIncomeTaxWithheld: dollars(8_940),
        socialSecurityWages: dollars(85_600),
        // Transposed from 5,307.20 — the defect GT-W2-005 is built to catch.
        socialSecurityTaxWithheld: dollars(5_037.2),
        medicareWages: dollars(85_600),
        medicareTaxWithheld: dollars(1_241.2),
        retirementPlan: true,
        box12: [{ code: 'D', amount: dollars(3_200) }],
        stateEntries: [
          {
            state: 'PA',
            employerStateIdNumber: '25123456',
            stateWages: dollars(85_600),
            stateIncomeTax: dollars(2_627.92),
            localityName: 'Pittsburgh',
            localWages: dollars(85_600),
            localIncomeTax: dollars(2_568),
          },
        ],
      },
      {
        id: 'w2-scr',
        belongsTo: 'spouse',
        employerName: 'Steel City Robotics LLC',
        // Keyed from a faxed copy; no EIN has ever been issued beginning 00.
        employerEin: '00-3315982',
        employerAddress: {
          line1: '2200 Smallman Street',
          city: 'Pittsburgh',
          state: 'PA',
          zip: '15222',
        },
        wages: dollars(61_250),
        federalIncomeTaxWithheld: dollars(5_410),
        socialSecurityWages: dollars(63_050),
        socialSecurityTaxWithheld: dollars(3_909.1),
        medicareWages: dollars(63_050),
        medicareTaxWithheld: dollars(890),
        stateEntries: [
          {
            state: 'PA',
            employerStateIdNumber: '25998877',
            stateWages: dollars(63_050),
            stateIncomeTax: dollars(1_935.64),
            localityName: 'Pittsburgh',
            localWages: dollars(63_050),
            localIncomeTax: dollars(1_891.5),
          },
        ],
      },
    ],
    form1099Int: [
      {
        id: '1099int-dollar',
        belongsTo: 'taxpayer',
        payerName: 'Dollar Bank, Federal Savings Bank',
        interestIncome: dollars(412.55),
      },
    ],
    form1099Div: [
      {
        id: '1099div-keystone',
        belongsTo: 'taxpayer',
        payerName: 'Keystone Broad Market Index Trust',
        ordinaryDividends: dollars(1_842.1),
        qualifiedDividends: dollars(1_610.44),
        capitalGainDistributions: dollars(220),
      },
    ],
    form1099Nec: [
      {
        id: '1099nec-carnegie',
        belongsTo: 'spouse',
        payerName: 'Carnegie Design Studio',
        nonemployeeCompensation: dollars(6_800),
      },
    ],
  },
  deduction: {
    method: 'itemized',
    itemized: {
      stateAndLocalIncomeOrSalesTax: dollars(10_000),
      homeMortgageInterest: dollars(18_420),
      charitableCash: dollars(5_380),
    },
  },
  credits: {
    childAndDependentCareCredit: true,
  },
  payments: {
    estimatedTaxPayments: dollars(1_200),
  },
  refund: {
    method: 'directDeposit',
    account: {
      routingNumber: '043000096',
      accountNumber: '000123456789',
      accountType: 'checking',
    },
  },
  signature: {
    method: 'selfSelectPin',
    taxpayerPin: '48213',
    spousePin: '30947',
    taxpayerPriorYearAgi: dollars(138_412),
    // The spouse shared secret was never collected — GT-EF-001.
    signatureDate: '2026-02-14',
    spouseSignatureDate: '2026-02-14',
  },
  preparer: {
    name: 'J. Okonkwo, EA',
    ptin: 'P01234567',
    firmName: 'GhimTech Tax',
    firmEin: '82-4417096',
    efin: '123456',
    phone: '(412) 555-0148',
  },
  thirdPartyDesignee: { allow: false },
  presidentialElectionFund: { taxpayer: false, spouse: false },
  digitalAssetTransactions: false,
  filingMethod: 'efile',
};

/**
 * Calculation-engine output for the sample return.
 *
 * Supplied to the diagnostics engine so the cross-total rules can run. Wages and
 * withholding deliberately reconcile to the source documents: the defects in
 * this return are data-entry defects, not arithmetic ones, and a totals mismatch
 * would drown them out.
 */
export const sampleComputed: ComputedTotals = {
  totalWages: dollars(143_650),
  taxableInterest: dollars(412.55),
  ordinaryDividends: dollars(1_842.1),
  qualifiedDividends: dollars(1_610.44),
  investmentIncome: dollars(2_474.65),
  earnedIncome: dollars(149_590),
  totalIncome: dollars(152_064.65),
  adjustedGrossIncome: dollars(151_225),
  deductionAmount: dollars(33_800),
  taxableIncome: dollars(117_425),
  totalTax: dollars(13_902),
  totalFederalWithholding: dollars(14_350),
  totalPayments: dollars(15_550),
  refundAmount: dollars(1_648),
};

/**
 * Run the engine over the sample return.
 *
 * Called on the server for every workspace screen. It is cheap and pure, so
 * there is nothing to cache and nothing to invalidate — the report a preparer
 * reads is always the report the current return produces.
 */
export function sampleDiagnostics(): DiagnosticReport {
  return runDiagnostics(sampleReturn, {
    computed: sampleComputed,
    asOfDate: SAMPLE_AS_OF_DATE,
  });
}

export { summarizeDiagnostics };

// ---------------------------------------------------------------------------
// A second return, clean but for one defect, used by rejection correction
// ---------------------------------------------------------------------------

/**
 * The return behind the sample rejection. Everything on it is in order except
 * the dependent identification number the IRS rejected, so correcting that one
 * value genuinely clears the report and genuinely unlocks retransmission.
 */
export const rejectionReturn: FederalReturn = {
  taxYear: SAMPLE_TAX_YEAR,
  filingStatus: 'headOfHousehold',
  taxpayer: {
    firstName: 'Denise',
    middleInitial: 'R',
    lastName: 'Whitfield',
    tin: '438-24-7715',
    dateOfBirth: '1990-07-19',
    occupation: 'Logistics coordinator',
  },
  address: {
    line1: '77 Chestnut Ridge Road',
    city: 'Harrisburg',
    state: 'PA',
    zip: '17110',
  },
  dependents: [
    {
      firstName: 'Isaiah',
      lastName: 'Whitfield',
      // Keyed as 000-11-2246; no Social Security number begins 000.
      tin: '000-11-2246',
      dateOfBirth: '2016-04-11',
      relationship: 'son',
      monthsLivedWithTaxpayer: 12,
      claimedForChildTaxCredit: true,
      isQualifyingPersonForHeadOfHousehold: true,
    },
  ],
  income: {
    w2s: [
      {
        id: 'w2-keystone-freight',
        belongsTo: 'taxpayer',
        employerName: 'Keystone Freight Systems',
        employerEin: '23-4471902',
        wages: dollars(54_300),
        federalIncomeTaxWithheld: dollars(4_120),
        socialSecurityWages: dollars(54_300),
        socialSecurityTaxWithheld: dollars(3_366.6),
        medicareWages: dollars(54_300),
        medicareTaxWithheld: dollars(787.35),
      },
    ],
  },
  deduction: { method: 'standard' },
  refund: { method: 'paperCheck' },
  signature: {
    method: 'selfSelectPin',
    taxpayerPin: '61094',
    taxpayerPriorYearAgi: dollars(51_880),
    signatureDate: '2026-01-28',
  },
  preparer: {
    name: 'J. Okonkwo, EA',
    ptin: 'P01234567',
    firmName: 'GhimTech Tax',
    efin: '123456',
  },
  filingMethod: 'efile',
};

export const rejectionComputed: ComputedTotals = {
  totalWages: dollars(54_300),
  earnedIncome: dollars(54_300),
  totalIncome: dollars(54_300),
  adjustedGrossIncome: dollars(54_300),
  deductionAmount: dollars(23_625),
  taxableIncome: dollars(30_675),
  totalTax: dollars(1_247),
  totalFederalWithholding: dollars(4_120),
  totalPayments: dollars(4_120),
  refundAmount: dollars(2_873),
};

/**
 * Re-run the engine over the rejected return with a corrected dependent
 * identification number. The correction screen calls this in the browser, which
 * is the point: the retransmit gate is the engine's answer, not a promise.
 */
export function diagnoseCorrection(correctedTin: string): DiagnosticReport {
  const first = rejectionReturn.dependents[0];
  if (first === undefined) {
    return runDiagnostics(rejectionReturn, {
      computed: rejectionComputed,
      asOfDate: SAMPLE_AS_OF_DATE,
    });
  }
  const corrected: FederalReturn = {
    ...rejectionReturn,
    dependents: [{ ...first, tin: correctedTin }, ...rejectionReturn.dependents.slice(1)],
  };
  return runDiagnostics(corrected, {
    computed: rejectionComputed,
    asOfDate: SAMPLE_AS_OF_DATE,
  });
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** `$1,234.56`. */
export function usd(amount: Money): string {
  return formatMoney(amount);
}

/** `1,234.56` — the form of an amount that sits inside a `$`-prefixed field. */
export function amountValue(amount: Money): string {
  return formatMoney(amount).replace('$', '');
}

/**
 * The only way an identification number reaches the screen. Full numbers are
 * never rendered — not in the workspace, not in the portal, not in an audit
 * line, and not for synthetic data either, because a habit that has exceptions
 * is not a habit.
 */
export function maskedTin(tin: string): string {
  return maskTin(tin);
}

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  marriedFilingJointly: 'Married filing jointly',
  marriedFilingSeparately: 'Married filing separately',
  headOfHousehold: 'Head of household',
  qualifyingSurvivingSpouse: 'Qualifying surviving spouse',
};

export function filingStatusLabel(status: FilingStatus): string {
  return FILING_STATUS_LABELS[status];
}

export function taxpayerName(federalReturn: FederalReturn): string {
  const { taxpayer, spouse } = federalReturn;
  const primary = `${taxpayer.firstName} ${taxpayer.lastName}`;
  if (!spouse) return primary;
  return `${primary} and ${spouse.firstName} ${spouse.lastName}`;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export type FederalSectionId =
  | 'filing-status'
  | 'dependents'
  | 'income'
  | 'adjustments'
  | 'deductions'
  | 'credits'
  | 'payments';

export type ReturnSectionId = FederalSectionId | 'pennsylvania' | 'review' | 'file';

export type SectionCompletion = 'complete' | 'in-progress' | 'not-started';

export interface ReturnSection {
  id: ReturnSectionId;
  label: string;
  /** One line, shown in the rail's mobile switcher and as a title attribute. */
  summary: string;
  completion: SectionCompletion;
  /** Paths into the return whose diagnostics belong to this section. */
  fieldPrefixes: readonly string[];
}

export const RETURN_SECTIONS: readonly ReturnSection[] = [
  {
    id: 'filing-status',
    label: 'Filing status and taxpayer',
    summary: 'Status, names, identification numbers, address.',
    completion: 'complete',
    fieldPrefixes: [
      'filingStatus',
      'taxpayer',
      'taxpayerClaimedAsDependent',
      'spouse',
      'spouseClaimedAsDependent',
      'spouseIsNonresidentAlien',
      'address',
      'livedApartFromSpouseLastSixMonths',
      'deceasedSpouseDateOfDeath',
    ],
  },
  {
    id: 'dependents',
    label: 'Dependents',
    summary: 'Children and other dependents, and the credits they support.',
    completion: 'in-progress',
    fieldPrefixes: ['dependents'],
  },
  {
    id: 'income',
    label: 'Income',
    summary: 'W-2s, interest, dividends, nonemployee compensation.',
    completion: 'in-progress',
    fieldPrefixes: ['income'],
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    summary: 'Above-the-line deductions taken before adjusted gross income.',
    completion: 'complete',
    fieldPrefixes: ['adjustments'],
  },
  {
    id: 'deductions',
    label: 'Deductions',
    summary: 'Standard or itemized, and the Schedule A detail.',
    completion: 'complete',
    fieldPrefixes: ['deduction'],
  },
  {
    id: 'credits',
    label: 'Credits',
    summary: 'Child, dependent care, education and retirement savings credits.',
    completion: 'in-progress',
    fieldPrefixes: ['credits'],
  },
  {
    id: 'payments',
    label: 'Payments',
    summary: 'Withholding, estimates, refund and balance-due elections.',
    completion: 'complete',
    fieldPrefixes: ['payments', 'refund', 'balanceDue'],
  },
  {
    id: 'pennsylvania',
    label: 'Pennsylvania',
    summary: 'PA-40 compensation, PA classes of income, local earned income tax.',
    completion: 'in-progress',
    fieldPrefixes: [],
  },
  {
    id: 'review',
    label: 'Review',
    summary: 'Second set of eyes before the return is authorized.',
    completion: 'not-started',
    fieldPrefixes: [],
  },
  {
    id: 'file',
    label: 'File',
    summary: 'Signature, preparer identifiers, transmission.',
    completion: 'not-started',
    fieldPrefixes: ['signature', 'preparer', 'thirdPartyDesignee', 'filingMethod'],
  },
];

export const FEDERAL_SECTION_IDS: readonly FederalSectionId[] = [
  'filing-status',
  'dependents',
  'income',
  'adjustments',
  'deductions',
  'credits',
  'payments',
];

export function isFederalSectionId(value: string): value is FederalSectionId {
  return (FEDERAL_SECTION_IDS as readonly string[]).includes(value);
}

/** Where a section lives, relative to the return root. */
export function sectionHref(returnId: string, id: ReturnSectionId): string {
  const base = `/app/returns/${returnId}`;
  if (id === 'pennsylvania') return `${base}/pennsylvania`;
  if (id === 'review') return `${base}/review`;
  if (id === 'file') return `${base}/summary`;
  return `${base}/federal/${id}`;
}

function matchesPrefix(field: string, prefix: string): boolean {
  return field === prefix || field.startsWith(`${prefix}.`) || field.startsWith(`${prefix}[`);
}

/** The section a diagnostic's field path belongs to, if any. */
export function sectionForField(field: string | undefined): ReturnSectionId | undefined {
  if (field === undefined) return undefined;
  for (const section of RETURN_SECTIONS) {
    for (const prefix of section.fieldPrefixes) {
      if (matchesPrefix(field, prefix)) return section.id;
    }
  }
  return undefined;
}

/**
 * A link that opens the section holding a field and asks it to reveal that
 * field. The path is carried as a query parameter rather than a fragment so the
 * server can render the row already marked.
 */
export function goToFieldHref(returnId: string, field: string | undefined): string | undefined {
  const section = sectionForField(field);
  if (section === undefined || field === undefined) return undefined;
  return `${sectionHref(returnId, section)}?field=${encodeURIComponent(field)}`;
}

export type SeverityCounts = Record<DiagnosticSeverity, number>;

const EMPTY_COUNTS: SeverityCounts = { reject: 0, error: 0, warning: 0, informational: 0 };

/** Diagnostic counts per section, for the completion marks in the rail. */
export function countsBySection(report: DiagnosticReport): Map<ReturnSectionId, SeverityCounts> {
  const map = new Map<ReturnSectionId, SeverityCounts>();
  for (const diagnostic of report.diagnostics) {
    const section = sectionForField(diagnostic.field);
    if (section === undefined) continue;
    const current = map.get(section) ?? { ...EMPTY_COUNTS };
    current[diagnostic.severity] += 1;
    map.set(section, current);
  }
  return map;
}

export function blockingIn(counts: SeverityCounts | undefined): number {
  if (counts === undefined) return 0;
  return counts.reject + counts.error;
}

export function totalIn(counts: SeverityCounts | undefined): number {
  if (counts === undefined) return 0;
  return counts.reject + counts.error + counts.warning + counts.informational;
}

/** Diagnostics attached to one section, in report order. */
export function diagnosticsForSection(
  report: DiagnosticReport,
  section: ReturnSectionId,
): Diagnostic[] {
  return report.diagnostics.filter((diagnostic) => sectionForField(diagnostic.field) === section);
}

export const SEVERITY_ORDER: readonly DiagnosticSeverity[] = [
  'reject',
  'error',
  'warning',
  'informational',
];

export const SEVERITY_HEADINGS: Record<DiagnosticSeverity, string> = {
  reject: 'Will be rejected by the IRS',
  error: 'Inconsistent or incorrect',
  warning: 'Worth a second look',
  informational: 'For your attention',
};

export const SEVERITY_EXPLANATIONS: Record<DiagnosticSeverity, string> = {
  reject: 'The Modernized e-File gateway refuses a transmission carrying any of these.',
  error: 'The return contradicts itself or a source document. These block transmission here.',
  warning: 'Probably a data-entry slip. Look before filing; these do not block transmission.',
  informational: 'An election, an opportunity, or a consequence worth recording in the file.',
};

// ---------------------------------------------------------------------------
// Plain language, for the client portal
// ---------------------------------------------------------------------------

/**
 * A taxpayer never sees a diagnostic code or an IRS business rule. They see what
 * it means for them, or they see that their preparer is on it.
 *
 * The mapping is by code prefix rather than by exact code so that a rule added
 * to the engine tomorrow degrades to the honest fallback instead of leaking
 * `GT-DEP-007` onto a portal page.
 */
const PLAIN_LANGUAGE: ReadonlyArray<{ prefix: string; text: string }> = [
  { prefix: 'GT-W2', text: 'One of your W-2s needs checking against the copy you sent us.' },
  { prefix: 'GT-INC', text: 'An income document needs checking against the copy you sent us.' },
  {
    prefix: 'GT-ID',
    text: 'A name, date of birth or identification number on the return needs confirming.',
  },
  { prefix: 'GT-DEP', text: 'Something about one of the people you are claiming needs confirming.' },
  { prefix: 'GT-FS', text: 'Your filing status needs confirming.' },
  { prefix: 'GT-EIC', text: 'A credit on your return needs confirming before it can be claimed.' },
  { prefix: 'GT-CR', text: 'A credit on your return needs confirming before it can be claimed.' },
  { prefix: 'GT-BANK', text: 'Your bank details for the refund need confirming.' },
  { prefix: 'GT-PAY', text: 'The payment arrangement on your return needs confirming.' },
  { prefix: 'GT-EF', text: 'Your return is not quite ready to be sent to the IRS yet.' },
];

export function plainLanguage(diagnostic: Diagnostic): string {
  const match = PLAIN_LANGUAGE.find((entry) => diagnostic.code.startsWith(entry.prefix));
  return match?.text ?? 'Your preparer is reviewing this.';
}

/**
 * What the portal says about a report as a whole: never a count of rejects,
 * always a state and a next action.
 */
export interface PortalReadiness {
  tone: 'waiting' | 'ready';
  headline: string;
  detail: string;
}

export function portalReadiness(report: DiagnosticReport): PortalReadiness {
  if (report.eFileEligible) {
    return {
      tone: 'ready',
      headline: 'Your return is ready for your signature',
      detail:
        'Your preparer has finished the checks. The next step is yours: read the summary and sign the authorization.',
    };
  }
  return {
    tone: 'waiting',
    headline: 'Your preparer is finishing a few checks',
    detail:
      'Nothing is needed from you right now. We will email you the moment your return is ready to sign.',
  };
}
