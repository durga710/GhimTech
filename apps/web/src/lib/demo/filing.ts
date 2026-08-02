/**
 * SAMPLE DATA for the filing lifecycle: the returns list, e-file submissions,
 * acknowledgements, rejections, Form 8879 authorizations, the review queue and
 * the client portal.
 *
 * Every client, employer, identifier and timestamp is invented. Identification
 * numbers are drawn from the 4xx-xx-xxxx range, are masked wherever they appear,
 * and belong to nobody. Submission and acknowledgement identifiers follow the
 * shape of the real ones so the screens can be read honestly, but no
 * transmission described here ever happened.
 *
 * Timestamps are written as ISO 8601 with an explicit offset. A filing record is
 * evidence, and evidence with an ambiguous clock is worth less than none.
 */
import type { AppRole } from '@/lib/navigation';
import { SAMPLE_TAX_YEAR, sampleComputed, usd } from '@/lib/demo/return';

// ---------------------------------------------------------------------------
// Who is signed in
// ---------------------------------------------------------------------------

export interface CurrentUser {
  name: string;
  initials: string;
  roles: readonly AppRole[];
  /**
   * Transmission is bound to the EFIN holder, not to whoever prepared the
   * return. The demonstration user prepares and reviews but does not transmit,
   * which is why the transmit control is visibly disabled and says why.
   */
  canTransmit: boolean;
  efinHolder: string;
}

export const currentUser: CurrentUser = {
  name: 'J. Okonkwo, EA',
  initials: 'JO',
  roles: ['preparer', 'reviewer'],
  canTransmit: false,
  efinHolder: 'A. Mensah (administrator)',
};

export function hasRole(role: AppRole): boolean {
  return currentUser.roles.includes(role);
}

// ---------------------------------------------------------------------------
// Returns
// ---------------------------------------------------------------------------

export type Jurisdiction = 'Federal' | 'Pennsylvania';

export type ReturnStage =
  | 'Intake'
  | 'In preparation'
  | 'Diagnostics'
  | 'In review'
  | 'Awaiting signature'
  | 'Ready to transmit'
  | 'Transmitted'
  | 'Accepted'
  | 'Rejected';

export interface ReturnListRow {
  id: string;
  clientName: string;
  clientTin: string;
  taxYear: number;
  jurisdictions: readonly Jurisdiction[];
  stage: ReturnStage;
  blockingDiagnostics: number;
  totalDiagnostics: number;
  preparer: string;
  reviewer: string | undefined;
  lastSavedIso: string;
  lastSavedLabel: string;
}

/** The return the workspace opens onto. */
export const SAMPLE_RETURN_ID = 'r-2025-0043';

/** The return behind the sample rejection. */
export const REJECTED_RETURN_ID = 'r-2025-0031';

export const returnRows: readonly ReturnListRow[] = [
  {
    id: SAMPLE_RETURN_ID,
    clientName: 'Ellery, Marcus and Nadia',
    clientTin: '412-88-4417',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'Diagnostics',
    blockingDiagnostics: 4,
    totalDiagnostics: 7,
    preparer: 'J. Okonkwo',
    reviewer: undefined,
    lastSavedIso: '2026-02-17T09:41:22-05:00',
    lastSavedLabel: 'Today, 09:41',
  },
  {
    id: REJECTED_RETURN_ID,
    clientName: 'Whitfield, Denise',
    clientTin: '438-24-7715',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'Rejected',
    blockingDiagnostics: 2,
    totalDiagnostics: 2,
    preparer: 'J. Okonkwo',
    reviewer: 'H. Lindqvist',
    lastSavedIso: '2026-02-16T16:04:51-05:00',
    lastSavedLabel: 'Yesterday, 16:04',
  },
  {
    id: 'r-2025-0038',
    clientName: 'Nakamura, Sora',
    clientTin: '454-19-6620',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal'],
    stage: 'In review',
    blockingDiagnostics: 0,
    totalDiagnostics: 3,
    preparer: 'J. Okonkwo',
    reviewer: 'H. Lindqvist',
    lastSavedIso: '2026-02-17T08:12:03-05:00',
    lastSavedLabel: 'Today, 08:12',
  },
  {
    id: 'r-2025-0040',
    clientName: 'Baptiste, Yvon and Clarisse',
    clientTin: '441-70-2298',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'Awaiting signature',
    blockingDiagnostics: 0,
    totalDiagnostics: 1,
    preparer: 'R. Vance',
    reviewer: 'H. Lindqvist',
    lastSavedIso: '2026-02-16T11:55:40-05:00',
    lastSavedLabel: 'Yesterday, 11:55',
  },
  {
    id: 'r-2025-0044',
    clientName: 'Osei, Kwabena',
    clientTin: '467-33-8104',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'In preparation',
    blockingDiagnostics: 6,
    totalDiagnostics: 9,
    preparer: 'J. Okonkwo',
    reviewer: undefined,
    lastSavedIso: '2026-02-17T10:07:19-05:00',
    lastSavedLabel: 'Today, 10:07',
  },
  {
    id: 'r-2025-0029',
    clientName: 'Perlmutter, Ida',
    clientTin: '419-05-7736',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'Accepted',
    blockingDiagnostics: 0,
    totalDiagnostics: 0,
    preparer: 'R. Vance',
    reviewer: 'H. Lindqvist',
    lastSavedIso: '2026-02-11T15:22:00-05:00',
    lastSavedLabel: '11 Feb, 15:22',
  },
  {
    id: 'r-2025-0046',
    clientName: 'Duarte, Ana Sofía',
    clientTin: '446-28-9017',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal'],
    stage: 'Intake',
    blockingDiagnostics: 0,
    totalDiagnostics: 0,
    preparer: 'Unassigned',
    reviewer: undefined,
    lastSavedIso: '2026-02-17T07:35:12-05:00',
    lastSavedLabel: 'Today, 07:35',
  },
  {
    id: 'r-2025-0035',
    clientName: 'Halloran, Peter and Ruth',
    clientTin: '433-61-4482',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    stage: 'Ready to transmit',
    blockingDiagnostics: 0,
    totalDiagnostics: 2,
    preparer: 'R. Vance',
    reviewer: 'H. Lindqvist',
    lastSavedIso: '2026-02-17T09:02:44-05:00',
    lastSavedLabel: 'Today, 09:02',
  },
];

export function returnRowById(id: string): ReturnListRow | undefined {
  return returnRows.find((row) => row.id === id);
}

/** Stages a preparer filters the list by, in workflow order. */
export const RETURN_STAGES: readonly ReturnStage[] = [
  'Intake',
  'In preparation',
  'Diagnostics',
  'In review',
  'Awaiting signature',
  'Ready to transmit',
  'Transmitted',
  'Accepted',
  'Rejected',
];

// ---------------------------------------------------------------------------
// Source documents
// ---------------------------------------------------------------------------

export interface DocumentBox {
  /** Box number as printed on the form, e.g. `1`, `12a`, `b`. */
  box: string;
  label: string;
  value: string;
  /** The return path this box is keyed into, when there is one. */
  fieldPath?: string;
  /** Amount boxes are set in tabular figures and right-aligned. */
  numeric?: boolean;
}

export interface SourceDocument {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  belongsTo: 'Taxpayer' | 'Spouse';
  receivedIso: string;
  receivedLabel: string;
  pages: number;
  source: 'Client upload' | 'Employer import' | 'Scanned in office';
  status: 'Keyed and matched' | 'Keyed, not matched' | 'Awaiting review';
  boxes: readonly DocumentBox[];
}

export const sourceDocuments: readonly SourceDocument[] = [
  {
    id: 'w2-ahn',
    kind: 'Form W-2',
    title: 'Allegheny Vista Health Partners',
    subtitle: 'Wage and Tax Statement · 2025',
    belongsTo: 'Taxpayer',
    receivedIso: '2026-01-29T13:20:04-05:00',
    receivedLabel: '29 January 2026',
    pages: 1,
    source: 'Client upload',
    status: 'Keyed and matched',
    boxes: [
      {
        box: 'b',
        label: 'Employer identification number',
        value: '25-1234563',
        fieldPath: 'income.w2s[0].employerEin',
      },
      { box: 'c', label: 'Employer name', value: 'Allegheny Vista Health Partners' },
      { box: '', label: 'Employer address', value: '900 Liberty Avenue, Pittsburgh PA 15222' },
      {
        box: '1',
        label: 'Wages, tips, other compensation',
        value: '82,400.00',
        fieldPath: 'income.w2s[0].wages',
        numeric: true,
      },
      {
        box: '2',
        label: 'Federal income tax withheld',
        value: '8,940.00',
        fieldPath: 'income.w2s[0].federalIncomeTaxWithheld',
        numeric: true,
      },
      {
        box: '3',
        label: 'Social Security wages',
        value: '85,600.00',
        fieldPath: 'income.w2s[0].socialSecurityWages',
        numeric: true,
      },
      {
        box: '4',
        label: 'Social Security tax withheld',
        value: '5,307.20',
        fieldPath: 'income.w2s[0].socialSecurityTaxWithheld',
        numeric: true,
      },
      {
        box: '5',
        label: 'Medicare wages and tips',
        value: '85,600.00',
        fieldPath: 'income.w2s[0].medicareWages',
        numeric: true,
      },
      {
        box: '6',
        label: 'Medicare tax withheld',
        value: '1,241.20',
        fieldPath: 'income.w2s[0].medicareTaxWithheld',
        numeric: true,
      },
      { box: '12a', label: 'Code D — elective deferrals', value: '3,200.00', numeric: true },
      { box: '13', label: 'Retirement plan', value: 'Checked' },
      { box: '15', label: 'State / Employer state ID', value: 'PA · 25123456' },
      { box: '16', label: 'State wages, tips, etc.', value: '85,600.00', numeric: true },
      { box: '17', label: 'State income tax', value: '2,627.92', numeric: true },
      { box: '18', label: 'Local wages, tips, etc.', value: '85,600.00', numeric: true },
      { box: '19', label: 'Local income tax', value: '2,568.00', numeric: true },
      { box: '20', label: 'Locality name', value: 'Pittsburgh' },
    ],
  },
  {
    id: 'w2-scr',
    kind: 'Form W-2',
    title: 'Steel City Robotics LLC',
    subtitle: 'Wage and Tax Statement · 2025',
    belongsTo: 'Spouse',
    receivedIso: '2026-02-03T09:14:47-05:00',
    receivedLabel: '3 February 2026',
    pages: 1,
    source: 'Scanned in office',
    status: 'Keyed, not matched',
    boxes: [
      {
        box: 'b',
        label: 'Employer identification number',
        value: '25-3315982',
        fieldPath: 'income.w2s[1].employerEin',
      },
      { box: 'c', label: 'Employer name', value: 'Steel City Robotics LLC' },
      { box: '', label: 'Employer address', value: '2200 Smallman Street, Pittsburgh PA 15222' },
      {
        box: '1',
        label: 'Wages, tips, other compensation',
        value: '61,250.00',
        fieldPath: 'income.w2s[1].wages',
        numeric: true,
      },
      {
        box: '2',
        label: 'Federal income tax withheld',
        value: '5,410.00',
        fieldPath: 'income.w2s[1].federalIncomeTaxWithheld',
        numeric: true,
      },
      {
        box: '3',
        label: 'Social Security wages',
        value: '63,050.00',
        fieldPath: 'income.w2s[1].socialSecurityWages',
        numeric: true,
      },
      {
        box: '4',
        label: 'Social Security tax withheld',
        value: '3,909.10',
        fieldPath: 'income.w2s[1].socialSecurityTaxWithheld',
        numeric: true,
      },
      {
        box: '5',
        label: 'Medicare wages and tips',
        value: '63,050.00',
        fieldPath: 'income.w2s[1].medicareWages',
        numeric: true,
      },
      {
        box: '6',
        label: 'Medicare tax withheld',
        value: '914.23',
        fieldPath: 'income.w2s[1].medicareTaxWithheld',
        numeric: true,
      },
      { box: '15', label: 'State / Employer state ID', value: 'PA · 25998877' },
      { box: '16', label: 'State wages, tips, etc.', value: '63,050.00', numeric: true },
      { box: '17', label: 'State income tax', value: '1,935.64', numeric: true },
      { box: '18', label: 'Local wages, tips, etc.', value: '63,050.00', numeric: true },
      { box: '19', label: 'Local income tax', value: '1,891.50', numeric: true },
      { box: '20', label: 'Locality name', value: 'Pittsburgh' },
    ],
  },
  {
    id: '1099int-dollar',
    kind: 'Form 1099-INT',
    title: 'Dollar Bank, Federal Savings Bank',
    subtitle: 'Interest Income · 2025',
    belongsTo: 'Taxpayer',
    receivedIso: '2026-01-29T13:20:04-05:00',
    receivedLabel: '29 January 2026',
    pages: 1,
    source: 'Client upload',
    status: 'Keyed and matched',
    boxes: [
      { box: '', label: 'Payer', value: 'Dollar Bank, Federal Savings Bank' },
      {
        box: '1',
        label: 'Interest income',
        value: '412.55',
        fieldPath: 'income.form1099Int[0].interestIncome',
        numeric: true,
      },
      { box: '4', label: 'Federal income tax withheld', value: '0.00', numeric: true },
    ],
  },
  {
    id: '1099div-keystone',
    kind: 'Form 1099-DIV',
    title: 'Keystone Broad Market Index Trust',
    subtitle: 'Dividends and Distributions · 2025',
    belongsTo: 'Taxpayer',
    receivedIso: '2026-02-05T18:44:12-05:00',
    receivedLabel: '5 February 2026',
    pages: 2,
    source: 'Client upload',
    status: 'Keyed and matched',
    boxes: [
      { box: '', label: 'Payer', value: 'Keystone Broad Market Index Trust' },
      {
        box: '1a',
        label: 'Total ordinary dividends',
        value: '1,842.10',
        fieldPath: 'income.form1099Div[0].ordinaryDividends',
        numeric: true,
      },
      {
        box: '1b',
        label: 'Qualified dividends',
        value: '1,610.44',
        fieldPath: 'income.form1099Div[0].qualifiedDividends',
        numeric: true,
      },
      {
        box: '2a',
        label: 'Total capital gain distributions',
        value: '220.00',
        fieldPath: 'income.form1099Div[0].capitalGainDistributions',
        numeric: true,
      },
    ],
  },
  {
    id: '1099nec-carnegie',
    kind: 'Form 1099-NEC',
    title: 'Carnegie Design Studio',
    subtitle: 'Nonemployee Compensation · 2025',
    belongsTo: 'Spouse',
    receivedIso: '2026-02-09T10:02:31-05:00',
    receivedLabel: '9 February 2026',
    pages: 1,
    source: 'Client upload',
    status: 'Awaiting review',
    boxes: [
      { box: '', label: 'Payer', value: 'Carnegie Design Studio' },
      {
        box: '1',
        label: 'Nonemployee compensation',
        value: '6,800.00',
        fieldPath: 'income.form1099Nec[0].nonemployeeCompensation',
        numeric: true,
      },
      { box: '4', label: 'Federal income tax withheld', value: '0.00', numeric: true },
    ],
  },
];

export function documentById(id: string): SourceDocument | undefined {
  return sourceDocuments.find((document) => document.id === id);
}

export interface DocumentMatch {
  document: SourceDocument;
  box: DocumentBox;
}

/** The document a field was keyed from, and the box it sits in. */
export function documentForField(field: string | undefined): DocumentMatch | undefined {
  if (field === undefined) return undefined;
  for (const document of sourceDocuments) {
    const box = document.boxes.find((entry) => entry.fieldPath === field);
    if (box) return { document, box };
  }
  return undefined;
}

/** The document that backs a whole section of data entry, when there is one. */
export function documentForSection(section: string): SourceDocument | undefined {
  if (section === 'income') return documentById('w2-ahn');
  return undefined;
}

// ---------------------------------------------------------------------------
// E-file submissions
// ---------------------------------------------------------------------------

export type SubmissionStatus = 'Built' | 'Transmitted' | 'Acknowledged' | 'Accepted' | 'Rejected';

export interface SubmissionEvent {
  status: SubmissionStatus;
  at: string;
  detail: string;
}

export interface Submission {
  id: string;
  returnId: string;
  clientName: string;
  jurisdiction: Jurisdiction;
  taxYear: number;
  status: SubmissionStatus;
  /** The identifier assigned when the submission was built for transmission. */
  submissionIdentifier: string;
  /** Present once the agency has acknowledged the submission. */
  acknowledgementIdentifier: string | undefined;
  events: readonly SubmissionEvent[];
  rejectionId: string | undefined;
}

export const submissions: readonly Submission[] = [
  {
    id: 'sub-fed-0031',
    returnId: REJECTED_RETURN_ID,
    clientName: 'Whitfield, Denise',
    jurisdiction: 'Federal',
    taxYear: SAMPLE_TAX_YEAR,
    status: 'Rejected',
    submissionIdentifier: '123456202603612345678',
    acknowledgementIdentifier: 'ACK-2026-0451182',
    rejectionId: 'rj-1187',
    events: [
      {
        status: 'Built',
        at: '2026-02-15T14:02:11-05:00',
        detail: 'Return assembled and validated against the federal schema.',
      },
      {
        status: 'Transmitted',
        at: '2026-02-15T14:06:38-05:00',
        detail: 'Delivered to the Modernized e-File gateway.',
      },
      {
        status: 'Acknowledged',
        at: '2026-02-15T20:41:02-05:00',
        detail: 'Acknowledgement retrieved. Acknowledgement ACK-2026-0451182.',
      },
      {
        status: 'Rejected',
        at: '2026-02-15T20:41:02-05:00',
        detail: 'One business rule failed: R0000-504-02.',
      },
    ],
  },
  {
    id: 'sub-pa-0031',
    returnId: REJECTED_RETURN_ID,
    clientName: 'Whitfield, Denise',
    jurisdiction: 'Pennsylvania',
    taxYear: SAMPLE_TAX_YEAR,
    status: 'Built',
    submissionIdentifier: 'PA-2026-0031-01',
    acknowledgementIdentifier: undefined,
    rejectionId: undefined,
    events: [
      {
        status: 'Built',
        at: '2026-02-15T14:02:14-05:00',
        detail: 'Held. Pennsylvania is transmitted only after the federal return is accepted.',
      },
    ],
  },
  {
    id: 'sub-fed-0029',
    returnId: 'r-2025-0029',
    clientName: 'Perlmutter, Ida',
    jurisdiction: 'Federal',
    taxYear: SAMPLE_TAX_YEAR,
    status: 'Accepted',
    submissionIdentifier: '123456202603512345601',
    acknowledgementIdentifier: 'ACK-2026-0448907',
    rejectionId: undefined,
    events: [
      {
        status: 'Built',
        at: '2026-02-11T15:24:03-05:00',
        detail: 'Return assembled and validated against the federal schema.',
      },
      {
        status: 'Transmitted',
        at: '2026-02-11T15:26:55-05:00',
        detail: 'Delivered to the Modernized e-File gateway.',
      },
      {
        status: 'Acknowledged',
        at: '2026-02-11T22:03:40-05:00',
        detail: 'Acknowledgement retrieved. Acknowledgement ACK-2026-0448907.',
      },
      {
        status: 'Accepted',
        at: '2026-02-11T22:03:40-05:00',
        detail: 'Accepted. No business rules failed.',
      },
    ],
  },
  {
    id: 'sub-pa-0029',
    returnId: 'r-2025-0029',
    clientName: 'Perlmutter, Ida',
    jurisdiction: 'Pennsylvania',
    taxYear: SAMPLE_TAX_YEAR,
    status: 'Accepted',
    submissionIdentifier: 'PA-2026-0029-01',
    acknowledgementIdentifier: 'PAACK-2026-118840',
    rejectionId: undefined,
    events: [
      {
        status: 'Built',
        at: '2026-02-11T22:05:12-05:00',
        detail: 'PA-40 assembled once the federal acceptance was recorded.',
      },
      {
        status: 'Transmitted',
        at: '2026-02-11T22:06:01-05:00',
        detail: 'Delivered to the Pennsylvania Department of Revenue.',
      },
      {
        status: 'Acknowledged',
        at: '2026-02-12T09:18:27-05:00',
        detail: 'Acknowledgement retrieved. Acknowledgement PAACK-2026-118840.',
      },
      {
        status: 'Accepted',
        at: '2026-02-12T09:18:27-05:00',
        detail: 'Accepted by the Commonwealth.',
      },
    ],
  },
  {
    id: 'sub-fed-0040',
    returnId: 'r-2025-0040',
    clientName: 'Baptiste, Yvon and Clarisse',
    jurisdiction: 'Federal',
    taxYear: SAMPLE_TAX_YEAR,
    status: 'Transmitted',
    submissionIdentifier: '123456202604812345712',
    acknowledgementIdentifier: undefined,
    rejectionId: undefined,
    events: [
      {
        status: 'Built',
        at: '2026-02-17T08:44:19-05:00',
        detail: 'Return assembled and validated against the federal schema.',
      },
      {
        status: 'Transmitted',
        at: '2026-02-17T08:46:02-05:00',
        detail: 'Delivered to the Modernized e-File gateway. Acknowledgement pending.',
      },
    ],
  },
];

export function submissionById(id: string): Submission | undefined {
  return submissions.find((submission) => submission.id === id);
}

export function submissionsForReturn(returnId: string): readonly Submission[] {
  return submissions.filter((submission) => submission.returnId === returnId);
}

/** The full lifecycle a submission passes through, for the timeline scaffold. */
export const SUBMISSION_LIFECYCLE: readonly SubmissionStatus[] = [
  'Built',
  'Transmitted',
  'Acknowledged',
  'Accepted',
];

// ---------------------------------------------------------------------------
// Rejections
// ---------------------------------------------------------------------------

export interface Rejection {
  id: string;
  submissionId: string;
  returnId: string;
  clientName: string;
  jurisdiction: Jurisdiction;
  taxYear: number;
  /** The agency's own business rule identifier, quoted exactly. */
  businessRule: string;
  /** One sentence a preparer can read to a client without translating it. */
  plainEnglish: string;
  /** What the agency's rule text says, quoted rather than paraphrased. */
  agencyText: string;
  field: string;
  fieldLabel: string;
  receivedAt: string;
  /** The perfection period for an electronically filed return. */
  correctBy: string;
  status: 'Open' | 'Corrected' | 'Retransmitted';
}

export const rejections: readonly Rejection[] = [
  {
    id: 'rj-1187',
    submissionId: 'sub-fed-0031',
    returnId: REJECTED_RETURN_ID,
    clientName: 'Whitfield, Denise',
    jurisdiction: 'Federal',
    taxYear: SAMPLE_TAX_YEAR,
    businessRule: 'R0000-504-02',
    plainEnglish:
      'The identification number and last name of the first dependent do not match what the Social Security Administration holds, so the IRS would not accept the return.',
    agencyText:
      'Each dependent SSN and the corresponding Dependent Name Control must match the e-File database.',
    field: 'dependents[0].tin',
    fieldLabel: 'Dependent 1 · Identification number',
    receivedAt: '2026-02-15T20:41:02-05:00',
    correctBy: '2026-02-20',
    status: 'Open',
  },
  {
    id: 'rj-1181',
    submissionId: 'sub-fed-0022',
    returnId: 'r-2025-0022',
    clientName: 'Ferrante, Luca',
    jurisdiction: 'Federal',
    taxYear: SAMPLE_TAX_YEAR,
    businessRule: 'IND-031-04',
    plainEnglish:
      'The prior-year adjusted gross income used to authenticate the electronic signature did not match the figure the IRS holds for last year.',
    agencyText:
      'The primary taxpayer prior year AGI or prior year PIN must match the e-File database.',
    field: 'signature.taxpayerPriorYearAgi',
    fieldLabel: 'Signature · Prior-year adjusted gross income',
    receivedAt: '2026-02-09T19:12:44-05:00',
    correctBy: '2026-02-14',
    status: 'Retransmitted',
  },
];

export function rejectionById(id: string): Rejection | undefined {
  return rejections.find((rejection) => rejection.id === id);
}

// ---------------------------------------------------------------------------
// Form 8879 authorizations
// ---------------------------------------------------------------------------

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export type AuthorizationStatus =
  | 'Awaiting signature'
  | 'Awaiting spouse'
  | 'Signed'
  | 'Expired'
  | 'Withdrawn';

export interface AuthorizationFigures {
  adjustedGrossIncome: string;
  totalTax: string;
  totalPayments: string;
  refund: string | undefined;
  balanceDue: string | undefined;
}

export interface Authorization {
  id: string;
  returnId: string;
  clientName: string;
  signerName: string;
  signerTin: string;
  spouseName: string | undefined;
  spouseTin: string | undefined;
  taxYear: number;
  jurisdictions: readonly Jurisdiction[];
  method: 'Remote — client portal' | 'In office';
  status: AuthorizationStatus;
  sentAt: string;
  signedAt: string | undefined;
  expiresAt: string;
  figures: AuthorizationFigures;
  audit: readonly AuditEntry[];
}

const sampleFigures: AuthorizationFigures = {
  adjustedGrossIncome: usd(sampleComputed.adjustedGrossIncome ?? 0),
  totalTax: usd(sampleComputed.totalTax ?? 0),
  totalPayments: usd(sampleComputed.totalPayments ?? 0),
  refund: usd(sampleComputed.refundAmount ?? 0),
  balanceDue: undefined,
};

export const authorizations: readonly Authorization[] = [
  {
    id: 'auth-0043',
    returnId: SAMPLE_RETURN_ID,
    clientName: 'Ellery, Marcus and Nadia',
    signerName: 'Marcus D. Ellery',
    signerTin: '412-88-4417',
    spouseName: 'Nadia P. Ellery',
    spouseTin: '429-71-3306',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    method: 'Remote — client portal',
    status: 'Awaiting signature',
    sentAt: '2026-02-17T10:15:00-05:00',
    signedAt: undefined,
    expiresAt: '2026-03-19',
    figures: sampleFigures,
    audit: [
      {
        at: '2026-02-17T10:15:00-05:00',
        actor: 'J. Okonkwo, EA',
        action: 'Authorization prepared',
        detail: 'Form 8879 generated from the return as computed at 10:14.',
      },
      {
        at: '2026-02-17T10:15:04-05:00',
        actor: 'System',
        action: 'Sent to client portal',
        detail: 'Notification emailed to the address on file. Link expires 19 March 2026.',
      },
    ],
  },
  {
    id: 'auth-0040',
    returnId: 'r-2025-0040',
    clientName: 'Baptiste, Yvon and Clarisse',
    signerName: 'Yvon Baptiste',
    signerTin: '441-70-2298',
    spouseName: 'Clarisse Baptiste',
    spouseTin: '448-16-5590',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    method: 'Remote — client portal',
    status: 'Signed',
    sentAt: '2026-02-16T09:30:00-05:00',
    signedAt: '2026-02-16T21:12:37-05:00',
    expiresAt: '2026-03-18',
    figures: {
      adjustedGrossIncome: '$96,204.00',
      totalTax: '$8,116.00',
      totalPayments: '$9,940.00',
      refund: '$1,824.00',
      balanceDue: undefined,
    },
    audit: [
      {
        at: '2026-02-16T09:30:00-05:00',
        actor: 'R. Vance',
        action: 'Authorization prepared',
        detail: 'Form 8879 generated from the return as computed at 09:29.',
      },
      {
        at: '2026-02-16T21:08:52-05:00',
        actor: 'Yvon Baptiste',
        action: 'Identity verified',
        detail: 'Date of birth and last four digits ***-**-2298 confirmed in the portal.',
      },
      {
        at: '2026-02-16T21:12:37-05:00',
        actor: 'Yvon Baptiste',
        action: 'Signed',
        detail: 'Typed signature captured with consent. Recorded from 198.51.100.24.',
      },
      {
        at: '2026-02-16T21:14:10-05:00',
        actor: 'Clarisse Baptiste',
        action: 'Signed',
        detail: 'Typed signature captured with consent. Recorded from 198.51.100.24.',
      },
    ],
  },
  {
    id: 'auth-0035',
    returnId: 'r-2025-0035',
    clientName: 'Halloran, Peter and Ruth',
    signerName: 'Peter Halloran',
    signerTin: '433-61-4482',
    spouseName: 'Ruth Halloran',
    spouseTin: '435-22-7761',
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal', 'Pennsylvania'],
    method: 'In office',
    status: 'Awaiting spouse',
    sentAt: '2026-02-14T11:00:00-05:00',
    signedAt: undefined,
    expiresAt: '2026-03-16',
    figures: {
      adjustedGrossIncome: '$142,880.00',
      totalTax: '$18,447.00',
      totalPayments: '$17,200.00',
      refund: undefined,
      balanceDue: '$1,247.00',
    },
    audit: [
      {
        at: '2026-02-14T11:00:00-05:00',
        actor: 'R. Vance',
        action: 'Authorization prepared',
        detail: 'Form 8879 printed for signature in office.',
      },
      {
        at: '2026-02-14T11:22:19-05:00',
        actor: 'Peter Halloran',
        action: 'Signed',
        detail: 'Wet signature captured in office and scanned to the file.',
      },
    ],
  },
  {
    id: 'auth-0026',
    returnId: 'r-2025-0026',
    clientName: 'Iyer, Meera',
    signerName: 'Meera Iyer',
    signerTin: '457-40-3312',
    spouseName: undefined,
    spouseTin: undefined,
    taxYear: SAMPLE_TAX_YEAR,
    jurisdictions: ['Federal'],
    method: 'Remote — client portal',
    status: 'Expired',
    sentAt: '2026-01-05T08:00:00-05:00',
    signedAt: undefined,
    expiresAt: '2026-02-04',
    figures: {
      adjustedGrossIncome: '$61,330.00',
      totalTax: '$4,902.00',
      totalPayments: '$5,410.00',
      refund: '$508.00',
      balanceDue: undefined,
    },
    audit: [
      {
        at: '2026-01-05T08:00:00-05:00',
        actor: 'J. Okonkwo, EA',
        action: 'Authorization prepared',
        detail: 'Form 8879 generated from the return as computed at 07:58.',
      },
      {
        at: '2026-02-04T00:00:00-05:00',
        actor: 'System',
        action: 'Expired unsigned',
        detail: 'The link expired after thirty days. A fresh authorization must be issued.',
      },
    ],
  },
];

export function authorizationById(id: string): Authorization | undefined {
  return authorizations.find((authorization) => authorization.id === id);
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export interface ReviewQueueRow {
  returnId: string;
  clientName: string;
  taxYear: number;
  preparer: string;
  submittedAt: string;
  submittedLabel: string;
  blockingDiagnostics: number;
  jurisdictions: readonly Jurisdiction[];
}

export const reviewQueue: readonly ReviewQueueRow[] = [
  {
    returnId: 'r-2025-0038',
    clientName: 'Nakamura, Sora',
    taxYear: SAMPLE_TAX_YEAR,
    preparer: 'J. Okonkwo',
    submittedAt: '2026-02-17T08:12:03-05:00',
    submittedLabel: 'Today, 08:12',
    blockingDiagnostics: 0,
    jurisdictions: ['Federal'],
  },
  {
    returnId: SAMPLE_RETURN_ID,
    clientName: 'Ellery, Marcus and Nadia',
    taxYear: SAMPLE_TAX_YEAR,
    preparer: 'J. Okonkwo',
    submittedAt: '2026-02-17T09:41:22-05:00',
    submittedLabel: 'Today, 09:41',
    blockingDiagnostics: 4,
    jurisdictions: ['Federal', 'Pennsylvania'],
  },
  {
    returnId: 'r-2025-0035',
    clientName: 'Halloran, Peter and Ruth',
    taxYear: SAMPLE_TAX_YEAR,
    preparer: 'R. Vance',
    submittedAt: '2026-02-17T09:02:44-05:00',
    submittedLabel: 'Today, 09:02',
    blockingDiagnostics: 0,
    jurisdictions: ['Federal', 'Pennsylvania'],
  },
];

export interface ReviewChecklistItem {
  id: string;
  label: string;
  guidance: string;
}

export const reviewChecklist: readonly ReviewChecklistItem[] = [
  {
    id: 'identity',
    label: 'Filing status, names and identification numbers',
    guidance:
      'Names match the Social Security cards. Filing status is supported by the facts in the file.',
  },
  {
    id: 'dependents',
    label: 'Dependents and the credits claimed for them',
    guidance:
      'Ages at the close of the year, months in the home, and the credit elected for each dependent.',
  },
  {
    id: 'income',
    label: 'Income against the source documents',
    guidance: 'Every W-2 and 1099 in the file is entered, and nothing is entered twice.',
  },
  {
    id: 'deductions',
    label: 'Deductions and adjustments',
    guidance: 'Itemising beats the standard deduction, and Schedule A detail is substantiated.',
  },
  {
    id: 'payments',
    label: 'Withholding, estimates and the refund election',
    guidance: 'Withholding traces to a document. Bank details were read back to the client.',
  },
  {
    id: 'pennsylvania',
    label: 'Pennsylvania and local',
    guidance:
      'PA classes of income, the resident school district, and the local earned income tax return.',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics cleared or accepted with a reason',
    guidance: 'No blocking diagnostic remains. Every accepted warning has a note saying why.',
  },
];

// ---------------------------------------------------------------------------
// Client portal
// ---------------------------------------------------------------------------

export interface PortalRequest {
  id: string;
  label: string;
  detail: string;
  status: 'Received' | 'Needed' | 'Being reviewed';
}

export const portalRequests: readonly PortalRequest[] = [
  {
    id: 'w2-ahn',
    label: 'W-2 from Allegheny Vista Health Partners',
    detail: 'Uploaded 29 January 2026 · 1 page',
    status: 'Received',
  },
  {
    id: 'w2-scr',
    label: 'W-2 from Steel City Robotics',
    detail: 'Scanned in our office 3 February 2026 · 1 page',
    status: 'Being reviewed',
  },
  {
    id: '1099int',
    label: '1099-INT from Dollar Bank',
    detail: 'Uploaded 29 January 2026 · 1 page',
    status: 'Received',
  },
  {
    id: '1099div',
    label: '1099-DIV from Keystone Broad Market Index Trust',
    detail: 'Uploaded 5 February 2026 · 2 pages',
    status: 'Received',
  },
  {
    id: 'childcare',
    label: 'Childcare provider statement',
    detail: 'We need the provider’s name, address and identification number for the care credit.',
    status: 'Needed',
  },
  {
    id: 'foster-letter',
    label: 'Placement letter for Samuel',
    detail: 'The county letter showing the date Samuel came to live with you.',
    status: 'Needed',
  },
];

export interface PortalTimelineEntry {
  label: string;
  detail: string;
  at: string | undefined;
  state: 'done' | 'current' | 'upcoming';
}

export const portalFederalTimeline: readonly PortalTimelineEntry[] = [
  {
    label: 'We received your documents',
    detail: 'Four documents are in your file.',
    at: '5 February 2026',
    state: 'done',
  },
  {
    label: 'Your return is being prepared',
    detail: 'Your preparer is working through the checks.',
    at: '17 February 2026',
    state: 'current',
  },
  {
    label: 'You sign the authorization',
    detail: 'We will email you when it is ready. Signing takes about two minutes.',
    at: undefined,
    state: 'upcoming',
  },
  {
    label: 'We send your return to the IRS',
    detail: 'Only after you have signed.',
    at: undefined,
    state: 'upcoming',
  },
  {
    label: 'The IRS confirms it has your return',
    detail: 'Usually within a day. We will tell you either way.',
    at: undefined,
    state: 'upcoming',
  },
];

export const portalPennsylvaniaTimeline: readonly PortalTimelineEntry[] = [
  {
    label: 'Your Pennsylvania return is being prepared',
    detail: 'It is prepared alongside your federal return.',
    at: '17 February 2026',
    state: 'current',
  },
  {
    label: 'We send it to Pennsylvania',
    detail: 'We wait for the IRS to confirm your federal return first. That is normal.',
    at: undefined,
    state: 'upcoming',
  },
  {
    label: 'Pennsylvania confirms it has your return',
    detail: 'We will let you know.',
    at: undefined,
    state: 'upcoming',
  },
];

export interface PortalClient {
  name: string;
  firstName: string;
  email: string;
  tin: string;
  spouseName: string;
  preparerName: string;
  practicePhone: string;
}

export const portalClient: PortalClient = {
  name: 'Marcus D. Ellery',
  firstName: 'Marcus',
  email: 'm.ellery@example.com',
  tin: '412-88-4417',
  spouseName: 'Nadia P. Ellery',
  preparerName: 'J. Okonkwo, EA',
  practicePhone: '(412) 555-0148',
};
