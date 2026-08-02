/**
 * In-memory store for development and tests. Implements the same interface
 * as the Prisma store; state lives for the process lifetime.
 */
import type { ChainedAuditEvent } from "@ghimtech/audit";
import type { ReturnStatus } from "@ghimtech/tax-domain";
import type {
  ClientRecord,
  DocumentRecord,
  ReturnRecord,
  SessionRecord,
  SignatureRecord,
  SnapshotRecord,
  StatusEventRecord,
  Store,
  SubmissionRecord,
  UserRecord,
} from "./types.js";

export class MemoryStore implements Store {
  readonly users = new Map<string, UserRecord>();
  readonly sessions = new Map<string, SessionRecord>();
  readonly clients = new Map<string, ClientRecord>();
  readonly returns = new Map<string, ReturnRecord>();
  readonly statusEvents: StatusEventRecord[] = [];
  readonly snapshots = new Map<string, SnapshotRecord>();
  readonly signatures = new Map<string, SignatureRecord>();
  readonly submissions = new Map<string, SubmissionRecord>();
  readonly documents = new Map<string, DocumentRecord>();
  readonly auditEvents: ChainedAuditEvent[] = [];

  async createUser(user: UserRecord): Promise<UserRecord> {
    if ([...this.users.values()].some((u) => u.email === user.email)) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    this.users.set(user.id, { ...user });
    return user;
  }
  async getUserById(id: string): Promise<UserRecord | undefined> {
    return this.users.get(id);
  }
  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return [...this.users.values()].find((u) => u.email === email);
  }
  async updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...patch };
    this.users.set(id, updated);
    return updated;
  }
  async listUsers(): Promise<UserRecord[]> {
    return [...this.users.values()];
  }

  async createSession(session: SessionRecord): Promise<SessionRecord> {
    this.sessions.set(session.id, { ...session });
    return session;
  }
  async getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | undefined> {
    return [...this.sessions.values()].find((s) => s.tokenHash === tokenHash);
  }
  async updateSession(id: string, patch: Partial<SessionRecord>): Promise<SessionRecord> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Session not found");
    const updated = { ...session, ...patch };
    this.sessions.set(id, updated);
    return updated;
  }
  async revokeUserSessions(userId: string): Promise<void> {
    const now = new Date().toISOString();
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt) session.revokedAt = now;
    }
  }

  async createClient(client: ClientRecord): Promise<ClientRecord> {
    this.clients.set(client.id, { ...client });
    return client;
  }
  async getClient(id: string): Promise<ClientRecord | undefined> {
    return this.clients.get(id);
  }
  async getClientByTinIndex(tinIndex: string): Promise<ClientRecord | undefined> {
    return [...this.clients.values()].find((c) => c.tinIndex === tinIndex);
  }
  async getClientByUserId(userId: string): Promise<ClientRecord | undefined> {
    return [...this.clients.values()].find((c) => c.userId === userId);
  }
  async listClients(): Promise<ClientRecord[]> {
    return [...this.clients.values()];
  }
  async updateClient(id: string, patch: Partial<ClientRecord>): Promise<ClientRecord> {
    const client = this.clients.get(id);
    if (!client) throw new Error("Client not found");
    const updated = { ...client, ...patch };
    this.clients.set(id, updated);
    return updated;
  }

  async createReturn(ret: ReturnRecord): Promise<ReturnRecord> {
    const duplicate = [...this.returns.values()].find(
      (r) => r.clientId === ret.clientId && r.taxYear === ret.taxYear,
    );
    if (duplicate) throw new Error("A return already exists for this client and tax year");
    this.returns.set(ret.id, { ...ret });
    return ret;
  }
  async getReturn(id: string): Promise<ReturnRecord | undefined> {
    return this.returns.get(id);
  }
  async listReturns(filter?: {
    clientId?: string;
    status?: ReturnStatus;
  }): Promise<ReturnRecord[]> {
    return [...this.returns.values()].filter(
      (r) =>
        (!filter?.clientId || r.clientId === filter.clientId) &&
        (!filter?.status || r.status === filter.status),
    );
  }
  async updateReturn(id: string, patch: Partial<ReturnRecord>): Promise<ReturnRecord> {
    const ret = this.returns.get(id);
    if (!ret) throw new Error("Return not found");
    const updated = { ...ret, ...patch, updatedAt: new Date().toISOString() };
    this.returns.set(id, updated);
    return updated;
  }
  async appendStatusEvent(event: StatusEventRecord): Promise<void> {
    this.statusEvents.push({ ...event });
  }
  async listStatusEvents(returnId: string): Promise<StatusEventRecord[]> {
    return this.statusEvents.filter((e) => e.returnId === returnId);
  }

  async saveSnapshot(snapshot: SnapshotRecord): Promise<void> {
    this.snapshots.set(`${snapshot.returnId}:${snapshot.snapshotHash}`, { ...snapshot });
  }
  async getSnapshot(returnId: string, hash: string): Promise<SnapshotRecord | undefined> {
    return this.snapshots.get(`${returnId}:${hash}`);
  }

  async createSignature(signature: SignatureRecord): Promise<SignatureRecord> {
    this.signatures.set(signature.id, { ...signature });
    return signature;
  }
  async listSignatures(returnId: string): Promise<SignatureRecord[]> {
    return [...this.signatures.values()].filter((s) => s.returnId === returnId);
  }
  async updateSignature(id: string, patch: Partial<SignatureRecord>): Promise<SignatureRecord> {
    const signature = this.signatures.get(id);
    if (!signature) throw new Error("Signature not found");
    const updated = { ...signature, ...patch };
    this.signatures.set(id, updated);
    return updated;
  }

  async createSubmission(submission: SubmissionRecord): Promise<SubmissionRecord> {
    this.submissions.set(submission.id, { ...submission });
    return submission;
  }
  async getSubmission(id: string): Promise<SubmissionRecord | undefined> {
    return this.submissions.get(id);
  }
  async findSubmissionBySnapshot(
    returnId: string,
    snapshotHash: string,
  ): Promise<SubmissionRecord | undefined> {
    return [...this.submissions.values()].find(
      (s) => s.returnId === returnId && s.snapshotHash === snapshotHash,
    );
  }
  async listSubmissions(returnId: string): Promise<SubmissionRecord[]> {
    return [...this.submissions.values()].filter((s) => s.returnId === returnId);
  }
  async updateSubmission(id: string, patch: Partial<SubmissionRecord>): Promise<SubmissionRecord> {
    const submission = this.submissions.get(id);
    if (!submission) throw new Error("Submission not found");
    const updated = { ...submission, ...patch };
    this.submissions.set(id, updated);
    return updated;
  }

  async createDocument(doc: DocumentRecord): Promise<DocumentRecord> {
    this.documents.set(doc.id, { ...doc });
    return doc;
  }
  async getDocument(id: string): Promise<DocumentRecord | undefined> {
    return this.documents.get(id);
  }
  async listDocuments(filter: { clientId?: string; returnId?: string }): Promise<DocumentRecord[]> {
    return [...this.documents.values()].filter(
      (d) =>
        (!filter.clientId || d.clientId === filter.clientId) &&
        (!filter.returnId || d.returnId === filter.returnId),
    );
  }
  async updateDocument(id: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const doc = this.documents.get(id);
    if (!doc) throw new Error("Document not found");
    const updated = { ...doc, ...patch };
    this.documents.set(id, updated);
    return updated;
  }

  async appendAuditEvent(event: ChainedAuditEvent): Promise<void> {
    this.auditEvents.push({ ...event });
  }
  async latestAuditEvent(): Promise<ChainedAuditEvent | undefined> {
    return this.auditEvents[this.auditEvents.length - 1];
  }
  async listAuditEvents(filter?: {
    entityId?: string;
    limit?: number;
  }): Promise<ChainedAuditEvent[]> {
    let events = this.auditEvents;
    if (filter?.entityId) events = events.filter((e) => e.entityId === filter.entityId);
    return events.slice(-(filter?.limit ?? 200));
  }
}
