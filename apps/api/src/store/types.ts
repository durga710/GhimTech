/**
 * Storage interface for the API. Two implementations:
 *   - MemoryStore: development and automated tests (no infrastructure needed)
 *   - PrismaStore: staging/production against PostgreSQL
 *
 * Handlers and services depend only on this interface, so every workflow and
 * permission test runs against the exact code paths production uses.
 */
import type { ChainedAuditEvent } from "@ghimtech/audit";
import type { ReturnStatus, Role, TaxReturnModel } from "@ghimtech/tax-domain";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  passwordResetForced: boolean;
  totpSecretEncrypted?: string;
  mfaEnrolled: boolean;
  recoveryCodeHashes: string[];
  failedLoginCount: number;
  lockedUntil?: string;
  disabled: boolean;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string;
  mfaVerifiedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ClientRecord {
  id: string;
  userId?: string;
  assignedPreparerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags: string[];
  tinEncrypted: string;
  tinLast4: string;
  tinIndex: string;
  dateOfBirth: string;
  address: { line1: string; line2?: string; city: string; state: string; zip: string };
  createdAt: string;
}

export interface ReturnRecord {
  id: string;
  clientId: string;
  taxYear: number;
  status: ReturnStatus;
  includePennsylvania: boolean;
  model: TaxReturnModel;
  /** Latest calculation snapshot hash, when calculated. */
  latestSnapshotHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusEventRecord {
  id: string;
  returnId: string;
  fromStatus: ReturnStatus;
  toStatus: ReturnStatus;
  actorId: string;
  actorRole: string;
  note?: string;
  createdAt: string;
}

export interface SnapshotRecord {
  id: string;
  returnId: string;
  snapshotHash: string;
  taxYear: number;
  ruleVersion: string;
  payload: unknown;
  createdById: string;
  createdAt: string;
}

export interface SignatureRecord {
  id: string;
  returnId: string;
  signerId: string;
  role: "TAXPAYER" | "SPOUSE";
  snapshotHash: string;
  payloadEncrypted: string;
  certificateHash: string;
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
  invalidatedAt?: string;
  invalidatedReason?: string;
}

export interface SubmissionRecord {
  id: string;
  returnId: string;
  jurisdiction: "FEDERAL" | "PENNSYLVANIA";
  provider: string;
  providerReturnId: string;
  providerSubmissionId: string;
  snapshotHash: string;
  state: "QUEUED" | "TRANSMITTING" | "TRANSMITTED" | "ACCEPTED" | "REJECTED";
  submittedById: string;
  submittedAt: string;
  resolvedAt?: string;
  correctsSubmissionId?: string;
  acknowledgment?: {
    accepted: boolean;
    agencyTrackingId?: string;
    rejections: Array<{ code: string; message: string; location?: string }>;
    acknowledgedAt: string;
  };
}

export interface DocumentRecord {
  id: string;
  clientId: string;
  returnId?: string;
  uploadedById: string;
  category: string;
  status: "UPLOADED" | "SCANNING" | "QUARANTINED" | "PENDING_VERIFICATION" | "VERIFIED" | "DELETED";
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  /** Encrypted content (dev store keeps it inline; production uses object storage). */
  contentEncrypted?: string;
  ocr?: unknown;
  verification?: unknown;
  createdAt: string;
}

export interface Store {
  // Users
  createUser(user: UserRecord): Promise<UserRecord>;
  getUserById(id: string): Promise<UserRecord | undefined>;
  getUserByEmail(email: string): Promise<UserRecord | undefined>;
  updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord>;
  listUsers(): Promise<UserRecord[]>;

  // Sessions
  createSession(session: SessionRecord): Promise<SessionRecord>;
  getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | undefined>;
  updateSession(id: string, patch: Partial<SessionRecord>): Promise<SessionRecord>;
  revokeUserSessions(userId: string): Promise<void>;

  // Clients
  createClient(client: ClientRecord): Promise<ClientRecord>;
  getClient(id: string): Promise<ClientRecord | undefined>;
  getClientByTinIndex(tinIndex: string): Promise<ClientRecord | undefined>;
  getClientByUserId(userId: string): Promise<ClientRecord | undefined>;
  listClients(): Promise<ClientRecord[]>;
  updateClient(id: string, patch: Partial<ClientRecord>): Promise<ClientRecord>;

  // Returns
  createReturn(ret: ReturnRecord): Promise<ReturnRecord>;
  getReturn(id: string): Promise<ReturnRecord | undefined>;
  listReturns(filter?: { clientId?: string; status?: ReturnStatus }): Promise<ReturnRecord[]>;
  updateReturn(id: string, patch: Partial<ReturnRecord>): Promise<ReturnRecord>;
  appendStatusEvent(event: StatusEventRecord): Promise<void>;
  listStatusEvents(returnId: string): Promise<StatusEventRecord[]>;

  // Snapshots
  saveSnapshot(snapshot: SnapshotRecord): Promise<void>;
  getSnapshot(returnId: string, hash: string): Promise<SnapshotRecord | undefined>;

  // Signatures
  createSignature(signature: SignatureRecord): Promise<SignatureRecord>;
  listSignatures(returnId: string): Promise<SignatureRecord[]>;
  updateSignature(id: string, patch: Partial<SignatureRecord>): Promise<SignatureRecord>;

  // Submissions
  createSubmission(submission: SubmissionRecord): Promise<SubmissionRecord>;
  getSubmission(id: string): Promise<SubmissionRecord | undefined>;
  findSubmissionBySnapshot(
    returnId: string,
    snapshotHash: string,
  ): Promise<SubmissionRecord | undefined>;
  listSubmissions(returnId: string): Promise<SubmissionRecord[]>;
  updateSubmission(id: string, patch: Partial<SubmissionRecord>): Promise<SubmissionRecord>;

  // Documents
  createDocument(doc: DocumentRecord): Promise<DocumentRecord>;
  getDocument(id: string): Promise<DocumentRecord | undefined>;
  listDocuments(filter: { clientId?: string; returnId?: string }): Promise<DocumentRecord[]>;
  updateDocument(id: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord>;

  // Audit
  appendAuditEvent(event: ChainedAuditEvent): Promise<void>;
  latestAuditEvent(): Promise<ChainedAuditEvent | undefined>;
  listAuditEvents(filter?: { entityId?: string; limit?: number }): Promise<ChainedAuditEvent[]>;
}
