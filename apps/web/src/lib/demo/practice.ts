/**
 * Sample practice data.
 *
 * Everything in this file is invented. No record here corresponds to a real
 * person, a real business, or a real taxpayer identification number. Names are
 * fictional, addresses are fictional, and identifiers are masked at rest: the
 * full nine digits of a taxpayer identification number are never stored, never
 * exported, and never rendered — only the last four, behind a mask.
 *
 * Screens read `IS_DEMO_DATA` so they can say plainly that the numbers on
 * screen are a demonstration rather than a practice's real book of business.
 */

export const IS_DEMO_DATA = true;

export const SAMPLE_DATA_NOTE =
  'Sample data. This environment is populated with synthetic records for demonstration.';

/** The tax year the workspace is currently filing. */
export const DEMO_TAX_YEAR = 2025;

/**
 * A fixed "now". Relative timestamps are computed against this rather than the
 * wall clock, so the server and the browser always render the same string and
 * the demo does not drift as the day passes.
 */
export const DEMO_NOW = '2026-03-14T14:20:00Z';

export const DEMO_PRACTICE = {
  name: 'Ridgeline Tax Partners',
  domain: 'ridgelinetax.example',
  city: 'Bethlehem',
  state: 'PA',
} as const;

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export type FilingStatus =
  | 'single'
  | 'married_joint'
  | 'married_separate'
  | 'head_of_household'
  | 'qualifying_surviving_spouse'
  | 'entity';

export const FILING_STATUS_LABEL: Record<FilingStatus, string> = {
  single: 'Single',
  married_joint: 'Married filing jointly',
  married_separate: 'Married filing separately',
  head_of_household: 'Head of household',
  qualifying_surviving_spouse: 'Qualifying surviving spouse',
  entity: 'Entity return',
};

export const FILING_STATUS_SHORT: Record<FilingStatus, string> = {
  single: 'Single',
  married_joint: 'MFJ',
  married_separate: 'MFS',
  head_of_household: 'HoH',
  qualifying_surviving_spouse: 'QSS',
  entity: 'Entity',
};

/** The stages a return moves through, in order. */
export type ReturnStage =
  | 'intake'
  | 'preparation'
  | 'review'
  | 'signature'
  | 'transmitted'
  | 'accepted'
  | 'rejected';

export const RETURN_STAGE_ORDER: ReturnStage[] = [
  'intake',
  'preparation',
  'review',
  'signature',
  'transmitted',
  'accepted',
  'rejected',
];

export const RETURN_STAGE_LABEL: Record<ReturnStage, string> = {
  intake: 'Intake',
  preparation: 'In preparation',
  review: 'In review',
  signature: 'Awaiting signature',
  transmitted: 'Transmitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export type StageTone = 'neutral' | 'accent' | 'warning' | 'error' | 'success';

export const RETURN_STAGE_TONE: Record<ReturnStage, StageTone> = {
  intake: 'neutral',
  preparation: 'accent',
  review: 'accent',
  signature: 'warning',
  transmitted: 'accent',
  accepted: 'success',
  rejected: 'error',
};

export type DocumentKind =
  | 'W-2'
  | '1099-NEC'
  | '1099-INT'
  | '1099-DIV'
  | '1099-B'
  | '1098'
  | '1098-T'
  | '1095-A'
  | 'K-1'
  | 'Receipt'
  | 'Prior return'
  | 'Identification'
  | 'Other';

export type DocumentStatus = 'uploaded' | 'classifying' | 'needs_review' | 'accepted' | 'rejected';

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  uploaded: 'Uploaded',
  classifying: 'Classifying',
  needs_review: 'Needs review',
  accepted: 'Accepted',
  rejected: 'Returned to client',
};

export type SubmissionStatus = 'queued' | 'transmitted' | 'accepted' | 'rejected';

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  queued: 'Queued',
  transmitted: 'Transmitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export type Jurisdiction = 'federal' | 'pennsylvania' | 'local';

export const JURISDICTION_LABEL: Record<Jurisdiction, string> = {
  federal: 'Federal · Form 1040',
  pennsylvania: 'Pennsylvania · PA-40',
  local: 'Local earned income',
};

export type AuthorizationState = 'not_sent' | 'sent' | 'viewed' | 'signed' | 'declined';

export const AUTHORIZATION_STATE_LABEL: Record<AuthorizationState, string> = {
  not_sent: 'Not sent',
  sent: 'Awaiting signature',
  viewed: 'Opened, unsigned',
  signed: 'Signed',
  declined: 'Declined',
};

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export type StaffRole = 'administrator' | 'preparer' | 'reviewer';
export type UserStatus = 'active' | 'invited' | 'suspended';
export type SecondFactor = 'authenticator_app' | 'security_key' | 'none';

export interface DemoUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: StaffRole;
  status: UserStatus;
  title: string;
  secondFactor: SecondFactor;
  lastActiveAt: string;
  invitedAt?: string;
  invitedBy?: string;
}

export interface DemoAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface DemoClient {
  id: string;
  name: string;
  /** Individuals carry a masked SSN, entities a masked EIN. */
  kind: 'individual' | 'entity';
  tinKind: 'ssn' | 'ein';
  /** Only ever the masked form. The full identifier is not held here. */
  maskedTin: string;
  email: string;
  phone: string;
  address: DemoAddress;
  filingStatus: FilingStatus;
  preparerId: string;
  portal: 'active' | 'invited' | 'none';
  createdAt: string;
  lastActivityAt: string;
  dependents: number;
  notes: string;
}

export interface DemoDiagnosticCounts {
  reject: number;
  error: number;
  warning: number;
  informational: number;
}

export interface DemoReturn {
  id: string;
  clientId: string;
  taxYear: number;
  federalForm: string;
  stateForm: string | null;
  stage: ReturnStage;
  preparerId: string;
  reviewerId: string | null;
  /** Adjusted gross income in whole dollars. */
  agi: number;
  /** Positive is a refund to the taxpayer, negative is a balance due. */
  refundOrBalance: number;
  diagnostics: DemoDiagnosticCounts;
  authorization: AuthorizationState;
  dueAt: string;
  updatedAt: string;
}

export interface DemoDocument {
  id: string;
  clientId: string;
  returnId: string | null;
  fileName: string;
  kind: DocumentKind;
  classification: string;
  status: DocumentStatus;
  sizeBytes: number;
  pages: number;
  uploadedAt: string;
  uploadedBy: string;
  source: 'client portal' | 'preparer upload' | 'scanner';
}

export interface DemoSubmission {
  id: string;
  returnId: string;
  clientId: string;
  jurisdiction: Jurisdiction;
  status: SubmissionStatus;
  submittedAt: string;
  acknowledgedAt: string | null;
  /** Present only when the taxing authority rejected the submission. */
  rejectionCode: string | null;
  rejectionReason: string | null;
}

export type AuditCategory =
  | 'authentication'
  | 'client'
  | 'return'
  | 'document'
  | 'filing'
  | 'settings'
  | 'access';

export const AUDIT_CATEGORY_LABEL: Record<AuditCategory, string> = {
  authentication: 'Authentication',
  client: 'Client',
  return: 'Return',
  document: 'Document',
  filing: 'Filing',
  settings: 'Settings',
  access: 'Access',
};

export interface DemoAuditEvent {
  id: string;
  /** ISO 8601, UTC, always with the trailing Z. */
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  subject: string;
  subjectId: string | null;
  category: AuditCategory;
  ip: string;
  userAgent: string;
  detail: { label: string; value: string }[];
}

export interface DemoActivity {
  id: string;
  clientId: string;
  at: string;
  actorName: string;
  summary: string;
}

export interface DemoSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  startedAt: string;
  lastSeenAt: string;
  current: boolean;
}

export interface DemoSignIn {
  id: string;
  at: string;
  userName: string;
  ip: string;
  location: string;
  method: 'password + authenticator' | 'password + security key' | 'password only';
  result: 'success' | 'failed' | 'blocked';
}

export type ProviderKind = 'efile_transmitter' | 'state_submission' | 'document_storage' | 'email';

export interface DemoProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  endpoint: string;
  environment: 'production' | 'sandbox';
  credentialLabel: string;
  /** Stored masked. Credentials are never echoed back to the browser. */
  maskedCredential: string;
  status: 'connected' | 'not_configured' | 'error';
  lastCheckedAt: string;
  note: string;
}

// ---------------------------------------------------------------------------
// The dataset
// ---------------------------------------------------------------------------

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u-101',
    name: 'Renata Kohl',
    initials: 'RK',
    email: 'renata.kohl@ridgelinetax.example',
    role: 'administrator',
    status: 'active',
    title: 'Managing partner',
    secondFactor: 'security_key',
    lastActiveAt: '2026-03-14T14:02:00Z',
  },
  {
    id: 'u-102',
    name: 'Marcus Aldred',
    initials: 'MA',
    email: 'marcus.aldred@ridgelinetax.example',
    role: 'preparer',
    status: 'active',
    title: 'Senior preparer',
    secondFactor: 'authenticator_app',
    lastActiveAt: '2026-03-14T13:48:00Z',
  },
  {
    id: 'u-103',
    name: 'Priya Nandakumar',
    initials: 'PN',
    email: 'priya.nandakumar@ridgelinetax.example',
    role: 'preparer',
    status: 'active',
    title: 'Preparer',
    secondFactor: 'authenticator_app',
    lastActiveAt: '2026-03-14T12:11:00Z',
  },
  {
    id: 'u-104',
    name: 'Tomas Beauchene',
    initials: 'TB',
    email: 'tomas.beauchene@ridgelinetax.example',
    role: 'reviewer',
    status: 'active',
    title: 'Review lead',
    secondFactor: 'security_key',
    lastActiveAt: '2026-03-14T11:26:00Z',
  },
  {
    id: 'u-105',
    name: 'Odalys Ferrant',
    initials: 'OF',
    email: 'odalys.ferrant@ridgelinetax.example',
    role: 'reviewer',
    status: 'active',
    title: 'Reviewer',
    secondFactor: 'authenticator_app',
    lastActiveAt: '2026-03-13T18:04:00Z',
  },
  {
    id: 'u-106',
    name: 'Wren Halloway',
    initials: 'WH',
    email: 'wren.halloway@ridgelinetax.example',
    role: 'preparer',
    status: 'invited',
    title: 'Seasonal preparer',
    secondFactor: 'none',
    lastActiveAt: '—',
    invitedAt: '2026-03-11T15:30:00Z',
    invitedBy: 'Renata Kohl',
  },
  {
    id: 'u-107',
    name: 'Silas Bramwell',
    initials: 'SB',
    email: 'silas.bramwell@ridgelinetax.example',
    role: 'preparer',
    status: 'suspended',
    title: 'Preparer',
    secondFactor: 'authenticator_app',
    lastActiveAt: '2026-02-02T09:15:00Z',
  },
];

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: 'c-2001',
    name: 'Marisol Trevino',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-4417',
    email: 'marisol.trevino@example.test',
    phone: '(610) 555-0114',
    address: { line1: '318 Larkspur Lane', city: 'Bethlehem', state: 'PA', postalCode: '18018' },
    filingStatus: 'single',
    preparerId: 'u-102',
    portal: 'active',
    createdAt: '2024-01-22T15:10:00Z',
    lastActivityAt: '2026-03-14T13:05:00Z',
    dependents: 0,
    notes: 'Second year with the practice. Schedule C income from freelance drafting work.',
  },
  {
    id: 'c-2002',
    name: 'Desmond & Junie Ashworth',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-8123',
    email: 'ashworth.household@example.test',
    phone: '(484) 555-0172',
    address: {
      line1: '1140 Coalbrook Road',
      line2: 'Unit 3',
      city: 'Allentown',
      state: 'PA',
      postalCode: '18104',
    },
    filingStatus: 'married_joint',
    preparerId: 'u-102',
    portal: 'active',
    createdAt: '2022-02-08T14:00:00Z',
    lastActivityAt: '2026-03-14T10:42:00Z',
    dependents: 2,
    notes: 'Mortgage interest and two dependents in college. 1098-T expected from both.',
  },
  {
    id: 'c-2003',
    name: 'Halvard Bruun',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-9052',
    email: 'h.bruun@example.test',
    phone: '(570) 555-0139',
    address: { line1: '76 Quarry Bend', city: 'Easton', state: 'PA', postalCode: '18042' },
    filingStatus: 'head_of_household',
    preparerId: 'u-103',
    portal: 'invited',
    createdAt: '2025-11-30T16:45:00Z',
    lastActivityAt: '2026-03-13T20:18:00Z',
    dependents: 1,
    notes: 'New client. Prior-year return supplied as PDF, not yet reconciled.',
  },
  {
    id: 'c-2004',
    name: 'Petra Nilsdotter',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-2260',
    email: 'petra.nilsdotter@example.test',
    phone: '(610) 555-0198',
    address: { line1: '2205 Wren Hollow Drive', city: 'Emmaus', state: 'PA', postalCode: '18049' },
    filingStatus: 'married_separate',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2023-03-01T13:20:00Z',
    lastActivityAt: '2026-03-12T17:55:00Z',
    dependents: 0,
    notes: 'Filing separately this year. Brokerage account with wash-sale adjustments.',
  },
  {
    id: 'c-2005',
    name: 'Cormac Vessey',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-7734',
    email: 'cormac.vessey@example.test',
    phone: '(484) 555-0107',
    address: { line1: '59 Tannery Row', city: 'Nazareth', state: 'PA', postalCode: '18064' },
    filingStatus: 'single',
    preparerId: 'u-102',
    portal: 'none',
    createdAt: '2021-01-19T11:05:00Z',
    lastActivityAt: '2026-03-14T09:41:00Z',
    dependents: 0,
    notes: 'Prefers paper delivery. Signature collected in office each year.',
  },
  {
    id: 'c-2006',
    name: 'Anouk De Vries',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-6189',
    email: 'anouk.devries@example.test',
    phone: '(610) 555-0143',
    address: { line1: '804 Kestrel Court', city: 'Bethlehem', state: 'PA', postalCode: '18017' },
    filingStatus: 'married_joint',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2020-02-14T10:30:00Z',
    lastActivityAt: '2026-03-11T14:02:00Z',
    dependents: 3,
    notes: 'Child and dependent care credit each year. Two wage statements per spouse.',
  },
  {
    id: 'c-2007',
    name: 'Bellwether Carpentry LLC',
    kind: 'entity',
    tinKind: 'ein',
    maskedTin: '**-***4290',
    email: 'accounts@bellwether-carpentry.example',
    phone: '(484) 555-0126',
    address: { line1: '31 Foundry Street', city: 'Allentown', state: 'PA', postalCode: '18102' },
    filingStatus: 'entity',
    preparerId: 'u-102',
    portal: 'active',
    createdAt: '2022-06-03T09:00:00Z',
    lastActivityAt: '2026-03-14T08:15:00Z',
    dependents: 0,
    notes: 'Two-member LLC taxed as a partnership. K-1s issued to both members.',
  },
  {
    id: 'c-2008',
    name: 'Ingrid Salcedo',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-3341',
    email: 'ingrid.salcedo@example.test',
    phone: '(570) 555-0165',
    address: { line1: '17 Meadowfen Way', city: 'Stroudsburg', state: 'PA', postalCode: '18360' },
    filingStatus: 'single',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2024-02-27T18:40:00Z',
    lastActivityAt: '2026-03-10T11:33:00Z',
    dependents: 0,
    notes: 'Marketplace health coverage. 1095-A reconciliation required.',
  },
  {
    id: 'c-2009',
    name: 'Theo Kastanis',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-5578',
    email: 'theo.kastanis@example.test',
    phone: '(610) 555-0188',
    address: { line1: '442 Bellwood Terrace', city: 'Emmaus', state: 'PA', postalCode: '18049' },
    filingStatus: 'single',
    preparerId: 'u-102',
    portal: 'invited',
    createdAt: '2026-01-08T14:12:00Z',
    lastActivityAt: '2026-03-09T16:20:00Z',
    dependents: 0,
    notes: 'Referred by an existing client. Intake questionnaire half complete.',
  },
  {
    id: 'c-2010',
    name: 'Rosalind Ffoulkes',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-1902',
    email: 'r.ffoulkes@example.test',
    phone: '(484) 555-0151',
    address: { line1: '90 Sparrowgrass Road', city: 'Hellertown', state: 'PA', postalCode: '18055' },
    filingStatus: 'qualifying_surviving_spouse',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2019-03-22T15:55:00Z',
    lastActivityAt: '2026-03-08T09:47:00Z',
    dependents: 1,
    notes: 'Long-standing client. Retirement distributions and social security benefits.',
  },
  {
    id: 'c-2011',
    name: 'Nkem Adeyinka',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-8806',
    email: 'nkem.adeyinka@example.test',
    phone: '(610) 555-0122',
    address: { line1: '1276 Alder Mill Lane', city: 'Bethlehem', state: 'PA', postalCode: '18020' },
    filingStatus: 'married_joint',
    preparerId: 'u-102',
    portal: 'active',
    createdAt: '2023-01-31T12:25:00Z',
    lastActivityAt: '2026-03-07T13:14:00Z',
    dependents: 2,
    notes: 'Rental property in a second county. Local earned income return required.',
  },
  {
    id: 'c-2012',
    name: 'Juniper Lockhart',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-4055',
    email: 'juniper.lockhart@example.test',
    phone: '(570) 555-0177',
    address: { line1: '23 Pikesend Avenue', city: 'Easton', state: 'PA', postalCode: '18045' },
    filingStatus: 'single',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2025-02-09T10:10:00Z',
    lastActivityAt: '2026-03-06T15:38:00Z',
    dependents: 0,
    notes: 'Student loan interest and tuition credits.',
  },
  {
    id: 'c-2013',
    name: 'Ferris Okonkwo',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-6612',
    email: 'ferris.okonkwo@example.test',
    phone: '(484) 555-0193',
    address: {
      line1: '705 Hollowbrook Circle',
      city: 'Allentown',
      state: 'PA',
      postalCode: '18103',
    },
    filingStatus: 'head_of_household',
    preparerId: 'u-102',
    portal: 'active',
    createdAt: '2021-02-17T17:05:00Z',
    lastActivityAt: '2026-03-05T12:52:00Z',
    dependents: 2,
    notes: 'Earned income credit each year. Dependent documentation held on file.',
  },
  {
    id: 'c-2014',
    name: 'Sable Ridge Pottery LLC',
    kind: 'entity',
    tinKind: 'ein',
    maskedTin: '**-***7715',
    email: 'books@sableridgepottery.example',
    phone: '(610) 555-0130',
    address: { line1: '12 Kiln Yard', city: 'Nazareth', state: 'PA', postalCode: '18064' },
    filingStatus: 'entity',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2024-04-11T13:45:00Z',
    lastActivityAt: '2026-03-04T10:26:00Z',
    dependents: 0,
    notes: 'Single-member LLC. Reported on the owner’s Schedule C.',
  },
  {
    id: 'c-2015',
    name: 'Maeve Quillon',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-2937',
    email: 'maeve.quillon@example.test',
    phone: '(570) 555-0184',
    address: {
      line1: '55 Winterbourne Street',
      city: 'Stroudsburg',
      state: 'PA',
      postalCode: '18360',
    },
    filingStatus: 'single',
    preparerId: 'u-102',
    portal: 'none',
    createdAt: '2026-02-20T09:35:00Z',
    lastActivityAt: '2026-03-03T14:41:00Z',
    dependents: 0,
    notes: 'Intake started at the front desk. No documents received yet.',
  },
  {
    id: 'c-2016',
    name: 'Aurelio Santangelo',
    kind: 'individual',
    tinKind: 'ssn',
    maskedTin: '***-**-7048',
    email: 'aurelio.santangelo@example.test',
    phone: '(610) 555-0166',
    address: { line1: '388 Vireo Path', city: 'Hellertown', state: 'PA', postalCode: '18055' },
    filingStatus: 'married_joint',
    preparerId: 'u-103',
    portal: 'active',
    createdAt: '2020-01-28T11:50:00Z',
    lastActivityAt: '2026-03-02T16:09:00Z',
    dependents: 1,
    notes: 'Self-employed consultant. Quarterly estimates tracked separately.',
  },
];

function diagnostics(
  reject: number,
  error: number,
  warning: number,
  informational: number,
): DemoDiagnosticCounts {
  return { reject, error, warning, informational };
}

export const DEMO_RETURNS: DemoReturn[] = [
  {
    id: 'r-3001',
    clientId: 'c-2001',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'review',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 84_310,
    refundOrBalance: 2_145,
    diagnostics: diagnostics(0, 2, 3, 1),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-14T13:05:00Z',
  },
  {
    id: 'r-3002',
    clientId: 'c-2002',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'signature',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 172_940,
    refundOrBalance: -3_812,
    diagnostics: diagnostics(0, 0, 1, 2),
    authorization: 'sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-14T10:42:00Z',
  },
  {
    id: 'r-3003',
    clientId: 'c-2003',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'intake',
    preparerId: 'u-103',
    reviewerId: null,
    agi: 0,
    refundOrBalance: 0,
    diagnostics: diagnostics(0, 0, 0, 4),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-13T20:18:00Z',
  },
  {
    id: 'r-3004',
    clientId: 'c-2004',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'preparation',
    preparerId: 'u-103',
    reviewerId: null,
    agi: 96_220,
    refundOrBalance: -1_078,
    diagnostics: diagnostics(1, 3, 2, 0),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-12T17:55:00Z',
  },
  {
    id: 'r-3005',
    clientId: 'c-2005',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'rejected',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 61_505,
    refundOrBalance: 918,
    diagnostics: diagnostics(1, 0, 0, 1),
    authorization: 'signed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-14T09:41:00Z',
  },
  {
    id: 'r-3006',
    clientId: 'c-2006',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'accepted',
    preparerId: 'u-103',
    reviewerId: 'u-105',
    agi: 148_760,
    refundOrBalance: 4_402,
    diagnostics: diagnostics(0, 0, 0, 1),
    authorization: 'signed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-11T14:02:00Z',
  },
  {
    id: 'r-3007',
    clientId: 'c-2007',
    taxYear: 2025,
    federalForm: '1065',
    stateForm: 'PA-20S/65',
    stage: 'review',
    preparerId: 'u-102',
    reviewerId: 'u-105',
    agi: 402_180,
    refundOrBalance: 0,
    diagnostics: diagnostics(0, 1, 4, 2),
    authorization: 'not_sent',
    dueAt: '2026-03-16T00:00:00Z',
    updatedAt: '2026-03-14T08:15:00Z',
  },
  {
    id: 'r-3008',
    clientId: 'c-2008',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'preparation',
    preparerId: 'u-103',
    reviewerId: null,
    agi: 52_940,
    refundOrBalance: 1_260,
    diagnostics: diagnostics(0, 2, 1, 0),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-10T11:33:00Z',
  },
  {
    id: 'r-3009',
    clientId: 'c-2009',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'intake',
    preparerId: 'u-102',
    reviewerId: null,
    agi: 0,
    refundOrBalance: 0,
    diagnostics: diagnostics(0, 0, 0, 3),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-09T16:20:00Z',
  },
  {
    id: 'r-3010',
    clientId: 'c-2010',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'transmitted',
    preparerId: 'u-103',
    reviewerId: 'u-104',
    agi: 71_615,
    refundOrBalance: 1_984,
    diagnostics: diagnostics(0, 0, 0, 0),
    authorization: 'signed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-08T09:47:00Z',
  },
  {
    id: 'r-3011',
    clientId: 'c-2011',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'review',
    preparerId: 'u-102',
    reviewerId: 'u-105',
    agi: 133_470,
    refundOrBalance: -2_207,
    diagnostics: diagnostics(0, 1, 5, 1),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-07T13:14:00Z',
  },
  {
    id: 'r-3012',
    clientId: 'c-2012',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'signature',
    preparerId: 'u-103',
    reviewerId: 'u-104',
    agi: 43_180,
    refundOrBalance: 1_512,
    diagnostics: diagnostics(0, 0, 1, 0),
    authorization: 'viewed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-06T15:38:00Z',
  },
  {
    id: 'r-3013',
    clientId: 'c-2013',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'accepted',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 38_905,
    refundOrBalance: 5_331,
    diagnostics: diagnostics(0, 0, 0, 2),
    authorization: 'signed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-05T12:52:00Z',
  },
  {
    id: 'r-3014',
    clientId: 'c-2014',
    taxYear: 2025,
    federalForm: '1040 · Schedule C',
    stateForm: 'PA-40',
    stage: 'preparation',
    preparerId: 'u-103',
    reviewerId: null,
    agi: 88_040,
    refundOrBalance: -4_615,
    diagnostics: diagnostics(0, 1, 3, 1),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-04T10:26:00Z',
  },
  {
    id: 'r-3015',
    clientId: 'c-2015',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'intake',
    preparerId: 'u-102',
    reviewerId: null,
    agi: 0,
    refundOrBalance: 0,
    diagnostics: diagnostics(0, 0, 0, 2),
    authorization: 'not_sent',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-03T14:41:00Z',
  },
  {
    id: 'r-3016',
    clientId: 'c-2016',
    taxYear: 2025,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'rejected',
    preparerId: 'u-103',
    reviewerId: 'u-105',
    agi: 115_260,
    refundOrBalance: -6_940,
    diagnostics: diagnostics(1, 1, 2, 0),
    authorization: 'signed',
    dueAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-03-02T16:09:00Z',
  },
  {
    id: 'r-2901',
    clientId: 'c-2001',
    taxYear: 2024,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'accepted',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 79_880,
    refundOrBalance: 1_602,
    diagnostics: diagnostics(0, 0, 0, 0),
    authorization: 'signed',
    dueAt: '2025-04-15T00:00:00Z',
    updatedAt: '2025-03-28T15:22:00Z',
  },
  {
    id: 'r-2802',
    clientId: 'c-2001',
    taxYear: 2023,
    federalForm: '1040',
    stateForm: 'PA-40',
    stage: 'accepted',
    preparerId: 'u-102',
    reviewerId: 'u-104',
    agi: 71_240,
    refundOrBalance: -418,
    diagnostics: diagnostics(0, 0, 0, 0),
    authorization: 'signed',
    dueAt: '2024-04-15T00:00:00Z',
    updatedAt: '2024-04-02T10:07:00Z',
  },
];

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: 'd-4001',
    clientId: 'c-2001',
    returnId: 'r-3001',
    fileName: 'trevino-w2-northbank.pdf',
    kind: 'W-2',
    classification: 'Wage statement · employer 1 of 1',
    status: 'accepted',
    sizeBytes: 214_882,
    pages: 1,
    uploadedAt: '2026-02-18T14:22:00Z',
    uploadedBy: 'Marisol Trevino',
    source: 'client portal',
  },
  {
    id: 'd-4002',
    clientId: 'c-2001',
    returnId: 'r-3001',
    fileName: 'trevino-1099nec-drafting.pdf',
    kind: '1099-NEC',
    classification: 'Nonemployee compensation · Schedule C',
    status: 'needs_review',
    sizeBytes: 148_390,
    pages: 1,
    uploadedAt: '2026-03-01T09:15:00Z',
    uploadedBy: 'Marisol Trevino',
    source: 'client portal',
  },
  {
    id: 'd-4003',
    clientId: 'c-2001',
    returnId: 'r-3001',
    fileName: 'trevino-mileage-log-2025.csv',
    kind: 'Receipt',
    classification: 'Vehicle mileage substantiation',
    status: 'needs_review',
    sizeBytes: 31_204,
    pages: 4,
    uploadedAt: '2026-03-12T16:48:00Z',
    uploadedBy: 'Marisol Trevino',
    source: 'client portal',
  },
  {
    id: 'd-4004',
    clientId: 'c-2002',
    returnId: 'r-3002',
    fileName: 'ashworth-1098-mortgage.pdf',
    kind: '1098',
    classification: 'Mortgage interest statement',
    status: 'accepted',
    sizeBytes: 302_115,
    pages: 2,
    uploadedAt: '2026-02-06T11:03:00Z',
    uploadedBy: 'Desmond Ashworth',
    source: 'client portal',
  },
  {
    id: 'd-4005',
    clientId: 'c-2002',
    returnId: 'r-3002',
    fileName: 'ashworth-1098t-elder.pdf',
    kind: '1098-T',
    classification: 'Tuition statement · dependent 1',
    status: 'accepted',
    sizeBytes: 188_442,
    pages: 1,
    uploadedAt: '2026-02-06T11:05:00Z',
    uploadedBy: 'Desmond Ashworth',
    source: 'client portal',
  },
  {
    id: 'd-4006',
    clientId: 'c-2002',
    returnId: 'r-3002',
    fileName: 'ashworth-1098t-younger.pdf',
    kind: '1098-T',
    classification: 'Tuition statement · dependent 2',
    status: 'needs_review',
    sizeBytes: 179_060,
    pages: 1,
    uploadedAt: '2026-03-13T18:52:00Z',
    uploadedBy: 'Junie Ashworth',
    source: 'client portal',
  },
  {
    id: 'd-4007',
    clientId: 'c-2003',
    returnId: 'r-3003',
    fileName: 'bruun-prior-year-2024.pdf',
    kind: 'Prior return',
    classification: 'Prior-year return · not yet reconciled',
    status: 'needs_review',
    sizeBytes: 1_402_776,
    pages: 22,
    uploadedAt: '2026-03-13T20:12:00Z',
    uploadedBy: 'Halvard Bruun',
    source: 'client portal',
  },
  {
    id: 'd-4008',
    clientId: 'c-2003',
    returnId: 'r-3003',
    fileName: 'bruun-identification.jpg',
    kind: 'Identification',
    classification: 'Photo identification',
    status: 'classifying',
    sizeBytes: 962_331,
    pages: 1,
    uploadedAt: '2026-03-14T07:44:00Z',
    uploadedBy: 'Halvard Bruun',
    source: 'client portal',
  },
  {
    id: 'd-4009',
    clientId: 'c-2004',
    returnId: 'r-3004',
    fileName: 'nilsdotter-1099b-consolidated.pdf',
    kind: '1099-B',
    classification: 'Consolidated brokerage · 148 lots',
    status: 'needs_review',
    sizeBytes: 4_820_119,
    pages: 41,
    uploadedAt: '2026-03-02T13:30:00Z',
    uploadedBy: 'Priya Nandakumar',
    source: 'preparer upload',
  },
  {
    id: 'd-4010',
    clientId: 'c-2004',
    returnId: 'r-3004',
    fileName: 'nilsdotter-1099div.pdf',
    kind: '1099-DIV',
    classification: 'Dividend income',
    status: 'accepted',
    sizeBytes: 122_004,
    pages: 1,
    uploadedAt: '2026-03-02T13:31:00Z',
    uploadedBy: 'Priya Nandakumar',
    source: 'preparer upload',
  },
  {
    id: 'd-4011',
    clientId: 'c-2005',
    returnId: 'r-3005',
    fileName: 'vessey-w2-riverstone.pdf',
    kind: 'W-2',
    classification: 'Wage statement · employer 1 of 1',
    status: 'accepted',
    sizeBytes: 208_774,
    pages: 1,
    uploadedAt: '2026-02-11T10:18:00Z',
    uploadedBy: 'Marcus Aldred',
    source: 'scanner',
  },
  {
    id: 'd-4012',
    clientId: 'c-2006',
    returnId: 'r-3006',
    fileName: 'devries-childcare-statement.pdf',
    kind: 'Receipt',
    classification: 'Dependent care provider statement',
    status: 'accepted',
    sizeBytes: 96_552,
    pages: 2,
    uploadedAt: '2026-02-01T15:40:00Z',
    uploadedBy: 'Anouk De Vries',
    source: 'client portal',
  },
  {
    id: 'd-4013',
    clientId: 'c-2007',
    returnId: 'r-3007',
    fileName: 'bellwether-k1-member-a.pdf',
    kind: 'K-1',
    classification: 'Partner distributive share · member A',
    status: 'needs_review',
    sizeBytes: 244_910,
    pages: 3,
    uploadedAt: '2026-03-13T09:22:00Z',
    uploadedBy: 'Marcus Aldred',
    source: 'preparer upload',
  },
  {
    id: 'd-4014',
    clientId: 'c-2007',
    returnId: 'r-3007',
    fileName: 'bellwether-k1-member-b.pdf',
    kind: 'K-1',
    classification: 'Partner distributive share · member B',
    status: 'needs_review',
    sizeBytes: 243_118,
    pages: 3,
    uploadedAt: '2026-03-14T08:15:00Z',
    uploadedBy: 'Marcus Aldred',
    source: 'preparer upload',
  },
  {
    id: 'd-4015',
    clientId: 'c-2008',
    returnId: 'r-3008',
    fileName: 'salcedo-1095a.pdf',
    kind: '1095-A',
    classification: 'Marketplace coverage · reconciliation required',
    status: 'needs_review',
    sizeBytes: 174_662,
    pages: 2,
    uploadedAt: '2026-03-09T12:05:00Z',
    uploadedBy: 'Ingrid Salcedo',
    source: 'client portal',
  },
  {
    id: 'd-4016',
    clientId: 'c-2008',
    returnId: 'r-3008',
    fileName: 'salcedo-w2-lakeside.pdf',
    kind: 'W-2',
    classification: 'Wage statement · employer 1 of 2',
    status: 'accepted',
    sizeBytes: 210_338,
    pages: 1,
    uploadedAt: '2026-02-22T17:29:00Z',
    uploadedBy: 'Ingrid Salcedo',
    source: 'client portal',
  },
  {
    id: 'd-4017',
    clientId: 'c-2009',
    returnId: 'r-3009',
    fileName: 'kastanis-intake-notes.pdf',
    kind: 'Other',
    classification: 'Intake questionnaire · incomplete',
    status: 'uploaded',
    sizeBytes: 58_140,
    pages: 3,
    uploadedAt: '2026-03-09T16:18:00Z',
    uploadedBy: 'Theo Kastanis',
    source: 'client portal',
  },
  {
    id: 'd-4018',
    clientId: 'c-2010',
    returnId: 'r-3010',
    fileName: 'ffoulkes-1099r-pension.pdf',
    kind: 'Other',
    classification: 'Retirement distribution',
    status: 'accepted',
    sizeBytes: 130_882,
    pages: 1,
    uploadedAt: '2026-02-14T10:55:00Z',
    uploadedBy: 'Rosalind Ffoulkes',
    source: 'client portal',
  },
  {
    id: 'd-4019',
    clientId: 'c-2011',
    returnId: 'r-3011',
    fileName: 'adeyinka-rental-ledger.xlsx',
    kind: 'Receipt',
    classification: 'Rental income and expense ledger',
    status: 'needs_review',
    sizeBytes: 402_998,
    pages: 6,
    uploadedAt: '2026-03-06T14:12:00Z',
    uploadedBy: 'Nkem Adeyinka',
    source: 'client portal',
  },
  {
    id: 'd-4020',
    clientId: 'c-2012',
    returnId: 'r-3012',
    fileName: 'lockhart-1098e-student-loan.pdf',
    kind: 'Other',
    classification: 'Student loan interest',
    status: 'accepted',
    sizeBytes: 88_240,
    pages: 1,
    uploadedAt: '2026-02-26T09:08:00Z',
    uploadedBy: 'Juniper Lockhart',
    source: 'client portal',
  },
  {
    id: 'd-4021',
    clientId: 'c-2013',
    returnId: 'r-3013',
    fileName: 'okonkwo-dependent-records.pdf',
    kind: 'Other',
    classification: 'Dependent residency substantiation',
    status: 'accepted',
    sizeBytes: 512_770,
    pages: 8,
    uploadedAt: '2026-02-19T13:37:00Z',
    uploadedBy: 'Marcus Aldred',
    source: 'scanner',
  },
  {
    id: 'd-4022',
    clientId: 'c-2014',
    returnId: 'r-3014',
    fileName: 'sable-ridge-sales-summary.pdf',
    kind: 'Receipt',
    classification: 'Gross receipts summary',
    status: 'rejected',
    sizeBytes: 268_450,
    pages: 5,
    uploadedAt: '2026-03-03T11:41:00Z',
    uploadedBy: 'Sable Ridge Pottery LLC',
    source: 'client portal',
  },
  {
    id: 'd-4023',
    clientId: 'c-2016',
    returnId: 'r-3016',
    fileName: 'santangelo-1099nec-consulting.pdf',
    kind: '1099-NEC',
    classification: 'Nonemployee compensation · Schedule C',
    status: 'accepted',
    sizeBytes: 151_226,
    pages: 1,
    uploadedAt: '2026-02-24T15:20:00Z',
    uploadedBy: 'Aurelio Santangelo',
    source: 'client portal',
  },
  {
    id: 'd-4024',
    clientId: 'c-2016',
    returnId: 'r-3016',
    fileName: 'santangelo-estimated-payments.pdf',
    kind: 'Receipt',
    classification: 'Quarterly estimated payment confirmations',
    status: 'needs_review',
    sizeBytes: 97_318,
    pages: 4,
    uploadedAt: '2026-03-02T16:02:00Z',
    uploadedBy: 'Aurelio Santangelo',
    source: 'client portal',
  },
];

export const DEMO_SUBMISSIONS: DemoSubmission[] = [
  {
    id: 's-5001',
    returnId: 'r-3005',
    clientId: 'c-2005',
    jurisdiction: 'federal',
    status: 'rejected',
    submittedAt: '2026-03-13T21:06:00Z',
    acknowledgedAt: '2026-03-14T09:41:00Z',
    rejectionCode: 'F1040-516',
    rejectionReason:
      'A taxpayer identification number on the return has already been used on an accepted return for this tax year.',
  },
  {
    id: 's-5002',
    returnId: 'r-3016',
    clientId: 'c-2016',
    jurisdiction: 'federal',
    status: 'rejected',
    submittedAt: '2026-03-01T19:14:00Z',
    acknowledgedAt: '2026-03-02T16:09:00Z',
    rejectionCode: 'IND-181-01',
    rejectionReason:
      'The identity protection personal identification number supplied does not match the number on file.',
  },
  {
    id: 's-5003',
    returnId: 'r-3006',
    clientId: 'c-2006',
    jurisdiction: 'federal',
    status: 'accepted',
    submittedAt: '2026-03-10T18:22:00Z',
    acknowledgedAt: '2026-03-11T14:02:00Z',
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5004',
    returnId: 'r-3006',
    clientId: 'c-2006',
    jurisdiction: 'pennsylvania',
    status: 'accepted',
    submittedAt: '2026-03-10T18:23:00Z',
    acknowledgedAt: '2026-03-11T13:40:00Z',
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5005',
    returnId: 'r-3013',
    clientId: 'c-2013',
    jurisdiction: 'federal',
    status: 'accepted',
    submittedAt: '2026-03-04T20:11:00Z',
    acknowledgedAt: '2026-03-05T12:52:00Z',
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5006',
    returnId: 'r-3013',
    clientId: 'c-2013',
    jurisdiction: 'pennsylvania',
    status: 'accepted',
    submittedAt: '2026-03-04T20:12:00Z',
    acknowledgedAt: '2026-03-05T11:18:00Z',
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5007',
    returnId: 'r-3010',
    clientId: 'c-2010',
    jurisdiction: 'federal',
    status: 'transmitted',
    submittedAt: '2026-03-14T06:30:00Z',
    acknowledgedAt: null,
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5008',
    returnId: 'r-3010',
    clientId: 'c-2010',
    jurisdiction: 'pennsylvania',
    status: 'transmitted',
    submittedAt: '2026-03-14T06:31:00Z',
    acknowledgedAt: null,
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5009',
    returnId: 'r-3010',
    clientId: 'c-2010',
    jurisdiction: 'local',
    status: 'queued',
    submittedAt: '2026-03-14T06:32:00Z',
    acknowledgedAt: null,
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5010',
    returnId: 'r-3013',
    clientId: 'c-2013',
    jurisdiction: 'local',
    status: 'accepted',
    submittedAt: '2026-03-04T20:13:00Z',
    acknowledgedAt: '2026-03-06T08:44:00Z',
    rejectionCode: null,
    rejectionReason: null,
  },
  {
    id: 's-5011',
    returnId: 'r-3005',
    clientId: 'c-2005',
    jurisdiction: 'pennsylvania',
    status: 'rejected',
    submittedAt: '2026-03-13T21:07:00Z',
    acknowledgedAt: '2026-03-14T08:02:00Z',
    rejectionCode: 'PA-40-0221',
    rejectionReason:
      'Reported state wages do not agree with the wage statements attached to the submission.',
  },
  {
    id: 's-5012',
    returnId: 'r-3016',
    clientId: 'c-2016',
    jurisdiction: 'pennsylvania',
    status: 'rejected',
    submittedAt: '2026-03-01T19:15:00Z',
    acknowledgedAt: '2026-03-02T15:30:00Z',
    rejectionCode: 'PA-40-0138',
    rejectionReason: 'Estimated payments claimed exceed the payments recorded for the account.',
  },
];

export const DEMO_AUDIT_EVENTS: DemoAuditEvent[] = [
  {
    id: 'a-6001',
    at: '2026-03-14T14:02:11Z',
    actorId: 'u-101',
    actorName: 'Renata Kohl',
    action: 'settings.provider.updated',
    subject: 'E-file transmitter endpoint',
    subjectId: 'p-7001',
    category: 'settings',
    ip: '198.51.100.24',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Field changed', value: 'Submission endpoint' },
      { label: 'Previous value', value: 'sandbox.transmit.example/v3' },
      { label: 'New value', value: 'transmit.example/v3' },
      { label: 'Credential', value: 'Unchanged, stored masked' },
    ],
  },
  {
    id: 'a-6002',
    at: '2026-03-14T13:05:47Z',
    actorId: 'u-102',
    actorName: 'Marcus Aldred',
    action: 'return.submitted_for_review',
    subject: 'Marisol Trevino · 2025 Form 1040',
    subjectId: 'r-3001',
    category: 'return',
    ip: '198.51.100.31',
    userAgent: 'Desktop · Firefox 141',
    detail: [
      { label: 'Return', value: 'r-3001' },
      { label: 'Taxpayer', value: '***-**-4417' },
      { label: 'Open diagnostics', value: '2 error, 3 warning' },
      { label: 'Assigned reviewer', value: 'Tomas Beauchene' },
    ],
  },
  {
    id: 'a-6003',
    at: '2026-03-14T09:41:22Z',
    actorId: 'system',
    actorName: 'Filing service',
    action: 'filing.acknowledgement_received',
    subject: 'Cormac Vessey · Federal submission',
    subjectId: 's-5001',
    category: 'filing',
    ip: '203.0.113.7',
    userAgent: 'Service · transmitter callback',
    detail: [
      { label: 'Submission', value: 's-5001' },
      { label: 'Result', value: 'Rejected' },
      { label: 'Code', value: 'F1040-516' },
      { label: 'Taxpayer', value: '***-**-7734' },
    ],
  },
  {
    id: 'a-6004',
    at: '2026-03-14T08:15:03Z',
    actorId: 'u-102',
    actorName: 'Marcus Aldred',
    action: 'document.uploaded',
    subject: 'Bellwether Carpentry LLC · K-1 member B',
    subjectId: 'd-4014',
    category: 'document',
    ip: '198.51.100.31',
    userAgent: 'Desktop · Firefox 141',
    detail: [
      { label: 'Document', value: 'bellwether-k1-member-b.pdf' },
      { label: 'Size', value: '243 KB' },
      { label: 'Classification', value: 'K-1 · partner distributive share' },
    ],
  },
  {
    id: 'a-6005',
    at: '2026-03-14T07:58:36Z',
    actorId: 'u-104',
    actorName: 'Tomas Beauchene',
    action: 'auth.signed_in',
    subject: 'Tomas Beauchene',
    subjectId: 'u-104',
    category: 'authentication',
    ip: '198.51.100.44',
    userAgent: 'Desktop · Safari 19',
    detail: [
      { label: 'Method', value: 'Password and security key' },
      { label: 'Device trusted', value: 'Yes, 28 days remaining' },
      { label: 'Location', value: 'Bethlehem, PA' },
    ],
  },
  {
    id: 'a-6006',
    at: '2026-03-14T06:30:12Z',
    actorId: 'u-103',
    actorName: 'Priya Nandakumar',
    action: 'filing.transmitted',
    subject: 'Rosalind Ffoulkes · Federal submission',
    subjectId: 's-5007',
    category: 'filing',
    ip: '198.51.100.52',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Submission', value: 's-5007' },
      { label: 'Jurisdiction', value: 'Federal · Form 1040' },
      { label: 'Authorization', value: 'Signed 2026-03-08' },
      { label: 'Taxpayer', value: '***-**-1902' },
    ],
  },
  {
    id: 'a-6007',
    at: '2026-03-13T21:06:55Z',
    actorId: 'u-102',
    actorName: 'Marcus Aldred',
    action: 'filing.transmitted',
    subject: 'Cormac Vessey · Federal submission',
    subjectId: 's-5001',
    category: 'filing',
    ip: '198.51.100.31',
    userAgent: 'Desktop · Firefox 141',
    detail: [
      { label: 'Submission', value: 's-5001' },
      { label: 'Jurisdiction', value: 'Federal · Form 1040' },
      { label: 'Taxpayer', value: '***-**-7734' },
    ],
  },
  {
    id: 'a-6008',
    at: '2026-03-13T20:18:41Z',
    actorId: 'c-2003',
    actorName: 'Halvard Bruun (client)',
    action: 'document.uploaded',
    subject: 'Halvard Bruun · prior-year return',
    subjectId: 'd-4007',
    category: 'document',
    ip: '192.0.2.88',
    userAgent: 'Mobile · Safari 19',
    detail: [
      { label: 'Document', value: 'bruun-prior-year-2024.pdf' },
      { label: 'Size', value: '1.4 MB' },
      { label: 'Channel', value: 'Client portal' },
    ],
  },
  {
    id: 'a-6009',
    at: '2026-03-13T16:44:09Z',
    actorId: 'u-101',
    actorName: 'Renata Kohl',
    action: 'access.role_changed',
    subject: 'Odalys Ferrant',
    subjectId: 'u-105',
    category: 'access',
    ip: '198.51.100.24',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Previous role', value: 'Preparer' },
      { label: 'New role', value: 'Reviewer' },
      { label: 'Effective', value: 'Immediately' },
    ],
  },
  {
    id: 'a-6010',
    at: '2026-03-13T11:02:18Z',
    actorId: 'u-105',
    actorName: 'Odalys Ferrant',
    action: 'return.review_note_added',
    subject: 'Nkem Adeyinka · 2025 Form 1040',
    subjectId: 'r-3011',
    category: 'return',
    ip: '198.51.100.61',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Return', value: 'r-3011' },
      { label: 'Note', value: 'Rental depreciation basis needs a supporting schedule.' },
      { label: 'Severity', value: 'Warning' },
    ],
  },
  {
    id: 'a-6011',
    at: '2026-03-12T17:55:27Z',
    actorId: 'u-103',
    actorName: 'Priya Nandakumar',
    action: 'return.diagnostics_run',
    subject: 'Petra Nilsdotter · 2025 Form 1040',
    subjectId: 'r-3004',
    category: 'return',
    ip: '198.51.100.52',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Return', value: 'r-3004' },
      { label: 'Result', value: '1 reject, 3 error, 2 warning' },
      { label: 'Blocking', value: 'Yes' },
    ],
  },
  {
    id: 'a-6012',
    at: '2026-03-12T09:30:04Z',
    actorId: 'u-101',
    actorName: 'Renata Kohl',
    action: 'access.user_suspended',
    subject: 'Silas Bramwell',
    subjectId: 'u-107',
    category: 'access',
    ip: '198.51.100.24',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Reason', value: 'Seasonal engagement ended' },
      { label: 'Sessions revoked', value: '2' },
      { label: 'Data retained', value: 'Yes, per retention policy' },
    ],
  },
  {
    id: 'a-6013',
    at: '2026-03-11T15:30:52Z',
    actorId: 'u-101',
    actorName: 'Renata Kohl',
    action: 'access.invitation_sent',
    subject: 'Wren Halloway',
    subjectId: 'u-106',
    category: 'access',
    ip: '198.51.100.24',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Role offered', value: 'Preparer' },
      { label: 'Expires', value: '2026-03-18' },
      { label: 'Second factor', value: 'Required at first sign-in' },
    ],
  },
  {
    id: 'a-6014',
    at: '2026-03-11T14:02:33Z',
    actorId: 'system',
    actorName: 'Filing service',
    action: 'filing.acknowledgement_received',
    subject: 'Anouk De Vries · Federal submission',
    subjectId: 's-5003',
    category: 'filing',
    ip: '203.0.113.7',
    userAgent: 'Service · transmitter callback',
    detail: [
      { label: 'Submission', value: 's-5003' },
      { label: 'Result', value: 'Accepted' },
      { label: 'Taxpayer', value: '***-**-6189' },
    ],
  },
  {
    id: 'a-6015',
    at: '2026-03-10T11:33:16Z',
    actorId: 'u-103',
    actorName: 'Priya Nandakumar',
    action: 'client.updated',
    subject: 'Ingrid Salcedo',
    subjectId: 'c-2008',
    category: 'client',
    ip: '198.51.100.52',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Field changed', value: 'Mailing address' },
      { label: 'Taxpayer', value: '***-**-3341' },
      { label: 'Verified against', value: 'Photo identification on file' },
    ],
  },
  {
    id: 'a-6016',
    at: '2026-03-09T16:20:44Z',
    actorId: 'c-2009',
    actorName: 'Theo Kastanis (client)',
    action: 'portal.intake_saved',
    subject: 'Theo Kastanis · intake questionnaire',
    subjectId: 'c-2009',
    category: 'client',
    ip: '192.0.2.140',
    userAgent: 'Mobile · Chromium 133',
    detail: [
      { label: 'Sections complete', value: '4 of 9' },
      { label: 'Channel', value: 'Client portal' },
    ],
  },
  {
    id: 'a-6017',
    at: '2026-03-08T09:47:02Z',
    actorId: 'c-2010',
    actorName: 'Rosalind Ffoulkes (client)',
    action: 'authorization.signed',
    subject: 'Rosalind Ffoulkes · Form 8879',
    subjectId: 'r-3010',
    category: 'return',
    ip: '192.0.2.211',
    userAgent: 'Desktop · Safari 19',
    detail: [
      { label: 'Return', value: 'r-3010' },
      { label: 'Signature method', value: 'Portal, identity questions answered' },
      { label: 'Taxpayer', value: '***-**-1902' },
    ],
  },
  {
    id: 'a-6018',
    at: '2026-03-07T13:14:38Z',
    actorId: 'u-102',
    actorName: 'Marcus Aldred',
    action: 'return.assigned',
    subject: 'Nkem Adeyinka · 2025 Form 1040',
    subjectId: 'r-3011',
    category: 'return',
    ip: '198.51.100.31',
    userAgent: 'Desktop · Firefox 141',
    detail: [
      { label: 'Assigned reviewer', value: 'Odalys Ferrant' },
      { label: 'Due', value: '2026-04-15' },
    ],
  },
  {
    id: 'a-6019',
    at: '2026-03-06T08:12:59Z',
    actorId: 'unknown',
    actorName: 'Unrecognised sign-in attempt',
    action: 'auth.sign_in_failed',
    subject: 'marcus.aldred@ridgelinetax.example',
    subjectId: 'u-102',
    category: 'authentication',
    ip: '203.0.113.199',
    userAgent: 'Desktop · unknown client',
    detail: [
      { label: 'Reason', value: 'Second factor not provided' },
      { label: 'Attempts', value: '3 in 4 minutes' },
      { label: 'Outcome', value: 'Address rate limited for 30 minutes' },
    ],
  },
  {
    id: 'a-6020',
    at: '2026-03-05T12:52:21Z',
    actorId: 'system',
    actorName: 'Filing service',
    action: 'filing.acknowledgement_received',
    subject: 'Ferris Okonkwo · Federal submission',
    subjectId: 's-5005',
    category: 'filing',
    ip: '203.0.113.7',
    userAgent: 'Service · transmitter callback',
    detail: [
      { label: 'Submission', value: 's-5005' },
      { label: 'Result', value: 'Accepted' },
      { label: 'Taxpayer', value: '***-**-6612' },
    ],
  },
  {
    id: 'a-6021',
    at: '2026-03-04T10:26:47Z',
    actorId: 'u-103',
    actorName: 'Priya Nandakumar',
    action: 'document.returned_to_client',
    subject: 'Sable Ridge Pottery LLC · sales summary',
    subjectId: 'd-4022',
    category: 'document',
    ip: '198.51.100.52',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Document', value: 'sable-ridge-sales-summary.pdf' },
      { label: 'Reason', value: 'Period covered does not match the tax year' },
      { label: 'Client notified', value: 'Yes' },
    ],
  },
  {
    id: 'a-6022',
    at: '2026-03-02T16:09:13Z',
    actorId: 'system',
    actorName: 'Filing service',
    action: 'filing.acknowledgement_received',
    subject: 'Aurelio Santangelo · Federal submission',
    subjectId: 's-5002',
    category: 'filing',
    ip: '203.0.113.7',
    userAgent: 'Service · transmitter callback',
    detail: [
      { label: 'Submission', value: 's-5002' },
      { label: 'Result', value: 'Rejected' },
      { label: 'Code', value: 'IND-181-01' },
      { label: 'Taxpayer', value: '***-**-7048' },
    ],
  },
  {
    id: 'a-6023',
    at: '2026-02-27T09:04:35Z',
    actorId: 'u-101',
    actorName: 'Renata Kohl',
    action: 'settings.retention_changed',
    subject: 'Data retention policy',
    subjectId: null,
    category: 'settings',
    ip: '198.51.100.24',
    userAgent: 'Desktop · Chromium 133',
    detail: [
      { label: 'Setting', value: 'Source document retention' },
      { label: 'Previous value', value: '5 years after filing' },
      { label: 'New value', value: '7 years after filing' },
    ],
  },
  {
    id: 'a-6024',
    at: '2026-02-20T09:35:08Z',
    actorId: 'u-102',
    actorName: 'Marcus Aldred',
    action: 'client.created',
    subject: 'Maeve Quillon',
    subjectId: 'c-2015',
    category: 'client',
    ip: '198.51.100.31',
    userAgent: 'Desktop · Firefox 141',
    detail: [
      { label: 'Taxpayer', value: '***-**-2937' },
      { label: 'Filing status', value: 'Single' },
      { label: 'Source', value: 'Front desk intake' },
    ],
  },
];

export const DEMO_ACTIVITY: DemoActivity[] = [
  {
    id: 'ac-1',
    clientId: 'c-2001',
    at: '2026-03-14T13:05:00Z',
    actorName: 'Marcus Aldred',
    summary: 'Submitted the 2025 return for review with two open errors.',
  },
  {
    id: 'ac-2',
    clientId: 'c-2001',
    at: '2026-03-12T16:48:00Z',
    actorName: 'Marisol Trevino',
    summary: 'Uploaded a vehicle mileage log through the client portal.',
  },
  {
    id: 'ac-3',
    clientId: 'c-2001',
    at: '2026-03-01T09:15:00Z',
    actorName: 'Marisol Trevino',
    summary: 'Uploaded a 1099-NEC for freelance drafting income.',
  },
  {
    id: 'ac-4',
    clientId: 'c-2001',
    at: '2026-02-18T14:22:00Z',
    actorName: 'Marisol Trevino',
    summary: 'Uploaded a wage statement; classified automatically and accepted.',
  },
  {
    id: 'ac-5',
    clientId: 'c-2001',
    at: '2026-01-14T10:00:00Z',
    actorName: 'Renata Kohl',
    summary: 'Opened the 2025 engagement and invited the taxpayer to the portal.',
  },
  {
    id: 'ac-6',
    clientId: 'c-2002',
    at: '2026-03-14T10:42:00Z',
    actorName: 'Marcus Aldred',
    summary: 'Sent the signature authorization to the taxpayer.',
  },
  {
    id: 'ac-7',
    clientId: 'c-2002',
    at: '2026-03-13T18:52:00Z',
    actorName: 'Junie Ashworth',
    summary: 'Uploaded the second tuition statement.',
  },
  {
    id: 'ac-8',
    clientId: 'c-2005',
    at: '2026-03-14T09:41:00Z',
    actorName: 'Filing service',
    summary: 'Federal submission rejected with code F1040-516.',
  },
  {
    id: 'ac-9',
    clientId: 'c-2005',
    at: '2026-03-13T21:06:00Z',
    actorName: 'Marcus Aldred',
    summary: 'Transmitted the federal and Pennsylvania returns.',
  },
  {
    id: 'ac-10',
    clientId: 'c-2007',
    at: '2026-03-14T08:15:00Z',
    actorName: 'Marcus Aldred',
    summary: 'Uploaded both partner K-1 statements for review.',
  },
];

export const DEMO_SESSIONS: DemoSession[] = [
  {
    id: 'sess-1',
    device: 'MacBook Pro · office',
    browser: 'Chromium 133',
    ip: '198.51.100.24',
    location: 'Bethlehem, Pennsylvania',
    startedAt: '2026-03-14T07:12:00Z',
    lastSeenAt: '2026-03-14T14:18:00Z',
    current: true,
  },
  {
    id: 'sess-2',
    device: 'iPad · reception desk',
    browser: 'Safari 19',
    ip: '198.51.100.29',
    location: 'Bethlehem, Pennsylvania',
    startedAt: '2026-03-13T09:04:00Z',
    lastSeenAt: '2026-03-13T17:40:00Z',
    current: false,
  },
  {
    id: 'sess-3',
    device: 'Windows laptop · home',
    browser: 'Firefox 141',
    ip: '203.0.113.51',
    location: 'Allentown, Pennsylvania',
    startedAt: '2026-03-11T20:22:00Z',
    lastSeenAt: '2026-03-12T00:06:00Z',
    current: false,
  },
];

export const DEMO_SIGN_INS: DemoSignIn[] = [
  {
    id: 'si-1',
    at: '2026-03-14T07:12:04Z',
    userName: 'Renata Kohl',
    ip: '198.51.100.24',
    location: 'Bethlehem, PA',
    method: 'password + security key',
    result: 'success',
  },
  {
    id: 'si-2',
    at: '2026-03-14T07:58:36Z',
    userName: 'Tomas Beauchene',
    ip: '198.51.100.44',
    location: 'Bethlehem, PA',
    method: 'password + security key',
    result: 'success',
  },
  {
    id: 'si-3',
    at: '2026-03-14T08:03:19Z',
    userName: 'Marcus Aldred',
    ip: '198.51.100.31',
    location: 'Bethlehem, PA',
    method: 'password + authenticator',
    result: 'success',
  },
  {
    id: 'si-4',
    at: '2026-03-06T08:12:59Z',
    userName: 'marcus.aldred@ridgelinetax.example',
    ip: '203.0.113.199',
    location: 'Unrecognised',
    method: 'password only',
    result: 'blocked',
  },
  {
    id: 'si-5',
    at: '2026-03-06T08:09:41Z',
    userName: 'marcus.aldred@ridgelinetax.example',
    ip: '203.0.113.199',
    location: 'Unrecognised',
    method: 'password only',
    result: 'failed',
  },
  {
    id: 'si-6',
    at: '2026-03-05T18:26:12Z',
    userName: 'Priya Nandakumar',
    ip: '198.51.100.52',
    location: 'Easton, PA',
    method: 'password + authenticator',
    result: 'success',
  },
];

export const DEMO_PROVIDERS: DemoProvider[] = [
  {
    id: 'p-7001',
    name: 'Federal e-file transmitter',
    kind: 'efile_transmitter',
    endpoint: 'https://transmit.example/v3/submissions',
    environment: 'production',
    credentialLabel: 'Transmitter API key',
    maskedCredential: '••••••••••••4c21',
    status: 'connected',
    lastCheckedAt: '2026-03-14T13:00:00Z',
    note: 'Acknowledgements are polled every fifteen minutes and written to the audit log.',
  },
  {
    id: 'p-7002',
    name: 'Pennsylvania submission service',
    kind: 'state_submission',
    endpoint: 'https://pa-submit.example/api/v2',
    environment: 'production',
    credentialLabel: 'State account secret',
    maskedCredential: '••••••••••••9f70',
    status: 'connected',
    lastCheckedAt: '2026-03-14T13:00:00Z',
    note: 'State returns are held until the federal submission is accepted, unless overridden.',
  },
  {
    id: 'p-7003',
    name: 'Local earned income service',
    kind: 'state_submission',
    endpoint: 'https://local-eit.example/submit',
    environment: 'sandbox',
    credentialLabel: 'Collector credentials',
    maskedCredential: '••••••••••••0b48',
    status: 'error',
    lastCheckedAt: '2026-03-14T12:45:00Z',
    note: 'The last connection check returned an authentication failure. Credentials need reissuing.',
  },
  {
    id: 'p-7004',
    name: 'Document storage',
    kind: 'document_storage',
    endpoint: 'https://storage.example/ridgeline',
    environment: 'production',
    credentialLabel: 'Storage access key',
    maskedCredential: '••••••••••••7ae3',
    status: 'connected',
    lastCheckedAt: '2026-03-14T13:00:00Z',
    note: 'Objects are encrypted at rest. Keys are held by the practice, not by the browser.',
  },
  {
    id: 'p-7005',
    name: 'Outbound email',
    kind: 'email',
    endpoint: 'smtp.example:587',
    environment: 'production',
    credentialLabel: 'SMTP password',
    maskedCredential: 'Not configured',
    status: 'not_configured',
    lastCheckedAt: '—',
    note: 'Client notifications fall back to portal-only delivery until this is configured.',
  },
];

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function userById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === id);
}

export function userName(id: string): string {
  return userById(id)?.name ?? 'Unassigned';
}

export function clientById(id: string): DemoClient | undefined {
  return DEMO_CLIENTS.find((client) => client.id === id);
}

export function clientName(id: string): string {
  return clientById(id)?.name ?? 'Unknown client';
}

export function returnsForClient(clientId: string): DemoReturn[] {
  return DEMO_RETURNS.filter((entry) => entry.clientId === clientId).sort(
    (a, b) => b.taxYear - a.taxYear,
  );
}

export function currentReturnForClient(clientId: string): DemoReturn | undefined {
  return DEMO_RETURNS.find(
    (entry) => entry.clientId === clientId && entry.taxYear === DEMO_TAX_YEAR,
  );
}

export function documentsForClient(clientId: string): DemoDocument[] {
  return DEMO_DOCUMENTS.filter((entry) => entry.clientId === clientId);
}

export function activityForClient(clientId: string): DemoActivity[] {
  return DEMO_ACTIVITY.filter((entry) => entry.clientId === clientId);
}

export function submissionsForClient(clientId: string): DemoSubmission[] {
  return DEMO_SUBMISSIONS.filter((entry) => entry.clientId === clientId);
}

/** The current-year returns, which is what every practice screen defaults to. */
export const CURRENT_RETURNS: DemoReturn[] = DEMO_RETURNS.filter(
  (entry) => entry.taxYear === DEMO_TAX_YEAR,
);

// ---------------------------------------------------------------------------
// Aggregates — computed from the records above, never asserted
// ---------------------------------------------------------------------------

export interface Tally {
  key: string;
  label: string;
  count: number;
}

export function returnsByStage(): Tally[] {
  return RETURN_STAGE_ORDER.map((stage) => ({
    key: stage,
    label: RETURN_STAGE_LABEL[stage],
    count: CURRENT_RETURNS.filter((entry) => entry.stage === stage).length,
  }));
}

export function returnsByPreparer(): Tally[] {
  return DEMO_USERS.map((user) => ({
    key: user.id,
    label: user.name,
    count: CURRENT_RETURNS.filter((entry) => entry.preparerId === user.id).length,
  }))
    .filter((tally) => tally.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function submissionsByStatus(): Tally[] {
  const statuses: SubmissionStatus[] = ['queued', 'transmitted', 'accepted', 'rejected'];
  return statuses.map((status) => ({
    key: status,
    label: SUBMISSION_STATUS_LABEL[status],
    count: DEMO_SUBMISSIONS.filter((entry) => entry.status === status).length,
  }));
}

export function rejectionReasons(): Tally[] {
  const grouped = new Map<string, number>();
  for (const submission of DEMO_SUBMISSIONS) {
    if (submission.status !== 'rejected' || !submission.rejectionCode) continue;
    grouped.set(submission.rejectionCode, (grouped.get(submission.rejectionCode) ?? 0) + 1);
  }
  return [...grouped.entries()]
    .map(([code, count]) => ({ key: code, label: code, count }))
    .sort((a, b) => b.count - a.count);
}

export function rejectionDetail(code: string): string {
  return (
    DEMO_SUBMISSIONS.find((entry) => entry.rejectionCode === code)?.rejectionReason ??
    'No description recorded.'
  );
}

export function totalDiagnostics(): DemoDiagnosticCounts {
  return CURRENT_RETURNS.reduce<DemoDiagnosticCounts>(
    (sum, entry) => ({
      reject: sum.reject + entry.diagnostics.reject,
      error: sum.error + entry.diagnostics.error,
      warning: sum.warning + entry.diagnostics.warning,
      informational: sum.informational + entry.diagnostics.informational,
    }),
    { reject: 0, error: 0, warning: 0, informational: 0 },
  );
}

export function documentsAwaitingReview(): DemoDocument[] {
  return DEMO_DOCUMENTS.filter(
    (entry) => entry.status === 'needs_review' || entry.status === 'classifying',
  );
}

export function authorizationsOutstanding(): DemoReturn[] {
  return CURRENT_RETURNS.filter(
    (entry) => entry.authorization === 'sent' || entry.authorization === 'viewed',
  );
}

export function returnsNeedingAttention(): DemoReturn[] {
  return CURRENT_RETURNS.filter(
    (entry) =>
      entry.stage === 'rejected' ||
      entry.diagnostics.reject > 0 ||
      entry.diagnostics.error > 0 ||
      entry.stage === 'review',
  ).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Formatted from the ISO string directly rather than through `Date`, so the
 * server and the browser cannot disagree about a time zone.
 */
export function formatIsoDate(iso: string): string {
  if (iso.length < 10) return iso;
  const month = MONTHS[Number(iso.slice(5, 7)) - 1] ?? '';
  return `${iso.slice(8, 10)} ${month} ${iso.slice(0, 4)}`;
}

export function formatIsoDateTime(iso: string): string {
  if (iso.length < 16) return iso;
  return `${formatIsoDate(iso)} · ${iso.slice(11, 16)} UTC`;
}

export function relativeToDemoNow(iso: string): string {
  if (iso.length < 10) return iso;
  const then = Date.parse(iso);
  const now = Date.parse(DEMO_NOW);
  if (Number.isNaN(then)) return iso;
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days} d ago`;
  return formatIsoDate(iso);
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatUsd(amount: number): string {
  return usd.format(amount);
}

/** A refund reads positive, a balance due reads as an owed amount. */
export function formatOutcome(amount: number): { text: string; kind: 'refund' | 'due' | 'none' } {
  if (amount === 0) return { text: '—', kind: 'none' };
  if (amount > 0) return { text: `${formatUsd(amount)} refund`, kind: 'refund' };
  return { text: `${formatUsd(Math.abs(amount))} due`, kind: 'due' };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Masks a taxpayer identification number to its last four digits. Nothing in
 * this product renders more than that, so this is the only formatter available.
 */
export function maskTin(lastFour: string, kind: 'ssn' | 'ein' = 'ssn'): string {
  const tail = lastFour.slice(-4);
  return kind === 'ssn' ? `***-**-${tail}` : `**-***${tail}`;
}
