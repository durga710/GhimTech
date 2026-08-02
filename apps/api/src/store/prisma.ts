/**
 * Prisma-backed store for staging/production. Maps the storage interface to
 * the PostgreSQL schema in @ghimtech/database.
 */
import type { ChainedAuditEvent } from "@ghimtech/audit";
import { getPrisma, type PrismaClient } from "@ghimtech/database";
import type { ReturnStatus, TaxReturnModel } from "@ghimtech/tax-domain";
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

const ORG_ID = "00000000-0000-0000-0000-000000000001";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapUser(u: any): UserRecord {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    passwordHash: u.passwordHash,
    passwordResetForced: u.passwordResetForced,
    totpSecretEncrypted: u.totpSecretEncrypted ?? undefined,
    mfaEnrolled: u.mfaEnrolled,
    recoveryCodeHashes: u.recoveryCodeHashes,
    failedLoginCount: u.failedLoginCount,
    lockedUntil: u.lockedUntil?.toISOString(),
    disabled: u.disabled,
  };
}

function mapClient(c: any): ClientRecord {
  const address = c.addresses?.[0];
  return {
    id: c.id,
    userId: c.userId ?? undefined,
    assignedPreparerId: c.assignedPreparerId ?? undefined,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone ?? undefined,
    tags: c.tags,
    tinEncrypted: c.identity?.tinEncrypted ?? "",
    tinLast4: c.identity?.tinLast4 ?? "",
    tinIndex: c.identity?.tinIndex ?? "",
    dateOfBirth: c.identity?.dateOfBirth?.toISOString().slice(0, 10) ?? "",
    address: address
      ? {
          line1: address.line1,
          line2: address.line2 ?? undefined,
          city: address.city,
          state: address.state,
          zip: address.zip,
        }
      : { line1: "", city: "", state: "", zip: "" },
    createdAt: c.createdAt.toISOString(),
  };
}

function mapReturn(r: any): ReturnRecord {
  return {
    id: r.id,
    clientId: r.clientId,
    taxYear: r.taxYear,
    status: r.status,
    includePennsylvania: r.includePennsylvania,
    model: r.model as TaxReturnModel,
    latestSnapshotHash: r.latestSnapshotHash ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

const clientInclude = { identity: true, addresses: { where: { current: true } } } as const;

export class PrismaStore implements Store {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient = getPrisma()) {
    this.db = db;
  }

  async ensureOrganization(): Promise<void> {
    await this.db.organization.upsert({
      where: { id: ORG_ID },
      create: { id: ORG_ID, name: "GhimTech" },
      update: {},
    });
  }

  async createUser(user: UserRecord): Promise<UserRecord> {
    const created = await this.db.user.create({
      data: {
        id: user.id,
        organizationId: ORG_ID,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        passwordResetForced: user.passwordResetForced,
        totpSecretEncrypted: user.totpSecretEncrypted,
        mfaEnrolled: user.mfaEnrolled,
        recoveryCodeHashes: user.recoveryCodeHashes,
        failedLoginCount: user.failedLoginCount,
        disabled: user.disabled,
      },
    });
    return mapUser(created);
  }
  async getUserById(id: string): Promise<UserRecord | undefined> {
    const user = await this.db.user.findUnique({ where: { id } });
    return user ? mapUser(user) : undefined;
  }
  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    const user = await this.db.user.findUnique({ where: { email } });
    return user ? mapUser(user) : undefined;
  }
  async updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord> {
    const updated = await this.db.user.update({
      where: { id },
      data: {
        ...("email" in patch ? { email: patch.email } : {}),
        ...("name" in patch ? { name: patch.name } : {}),
        ...("role" in patch ? { role: patch.role } : {}),
        ...("passwordHash" in patch ? { passwordHash: patch.passwordHash } : {}),
        ...("passwordResetForced" in patch
          ? { passwordResetForced: patch.passwordResetForced }
          : {}),
        ...("totpSecretEncrypted" in patch
          ? { totpSecretEncrypted: patch.totpSecretEncrypted }
          : {}),
        ...("mfaEnrolled" in patch ? { mfaEnrolled: patch.mfaEnrolled } : {}),
        ...("recoveryCodeHashes" in patch ? { recoveryCodeHashes: patch.recoveryCodeHashes } : {}),
        ...("failedLoginCount" in patch ? { failedLoginCount: patch.failedLoginCount } : {}),
        ...("lockedUntil" in patch
          ? { lockedUntil: patch.lockedUntil ? new Date(patch.lockedUntil) : null }
          : {}),
        ...("disabled" in patch ? { disabled: patch.disabled } : {}),
      },
    });
    return mapUser(updated);
  }
  async listUsers(): Promise<UserRecord[]> {
    return (await this.db.user.findMany()).map(mapUser);
  }

  async createSession(session: SessionRecord): Promise<SessionRecord> {
    await this.db.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        expiresAt: new Date(session.expiresAt),
        mfaVerifiedAt: session.mfaVerifiedAt ? new Date(session.mfaVerifiedAt) : undefined,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });
    return session;
  }
  async getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | undefined> {
    const session = await this.db.session.findUnique({ where: { tokenHash } });
    if (!session) return undefined;
    return {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString(),
      mfaVerifiedAt: session.mfaVerifiedAt?.toISOString(),
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
    };
  }
  async updateSession(id: string, patch: Partial<SessionRecord>): Promise<SessionRecord> {
    const updated = await this.db.session.update({
      where: { id },
      data: {
        ...("revokedAt" in patch
          ? { revokedAt: patch.revokedAt ? new Date(patch.revokedAt) : null }
          : {}),
        ...("mfaVerifiedAt" in patch
          ? { mfaVerifiedAt: patch.mfaVerifiedAt ? new Date(patch.mfaVerifiedAt) : null }
          : {}),
        ...("expiresAt" in patch && patch.expiresAt
          ? { expiresAt: new Date(patch.expiresAt) }
          : {}),
      },
    });
    return {
      id: updated.id,
      userId: updated.userId,
      tokenHash: updated.tokenHash,
      expiresAt: updated.expiresAt.toISOString(),
      revokedAt: updated.revokedAt?.toISOString(),
      mfaVerifiedAt: updated.mfaVerifiedAt?.toISOString(),
    };
  }
  async revokeUserSessions(userId: string): Promise<void> {
    await this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createClient(client: ClientRecord): Promise<ClientRecord> {
    const created = await this.db.client.create({
      data: {
        id: client.id,
        organizationId: ORG_ID,
        userId: client.userId,
        assignedPreparerId: client.assignedPreparerId,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        tags: client.tags,
        identity: {
          create: {
            tinEncrypted: client.tinEncrypted,
            tinLast4: client.tinLast4,
            tinIndex: client.tinIndex,
            dateOfBirth: new Date(client.dateOfBirth),
          },
        },
        addresses: { create: { ...client.address } },
      },
      include: clientInclude,
    });
    return mapClient(created);
  }
  async getClient(id: string): Promise<ClientRecord | undefined> {
    const client = await this.db.client.findUnique({ where: { id }, include: clientInclude });
    return client ? mapClient(client) : undefined;
  }
  async getClientByTinIndex(tinIndex: string): Promise<ClientRecord | undefined> {
    const identity = await this.db.identityRecord.findUnique({
      where: { tinIndex },
      include: { client: { include: clientInclude } },
    });
    return identity ? mapClient(identity.client) : undefined;
  }
  async getClientByUserId(userId: string): Promise<ClientRecord | undefined> {
    const client = await this.db.client.findUnique({ where: { userId }, include: clientInclude });
    return client ? mapClient(client) : undefined;
  }
  async listClients(): Promise<ClientRecord[]> {
    return (await this.db.client.findMany({ include: clientInclude })).map(mapClient);
  }
  async updateClient(id: string, patch: Partial<ClientRecord>): Promise<ClientRecord> {
    const updated = await this.db.client.update({
      where: { id },
      data: {
        ...("assignedPreparerId" in patch ? { assignedPreparerId: patch.assignedPreparerId } : {}),
        ...("email" in patch && patch.email ? { email: patch.email } : {}),
        ...("phone" in patch ? { phone: patch.phone } : {}),
        ...("tags" in patch && patch.tags ? { tags: patch.tags } : {}),
      },
      include: clientInclude,
    });
    return mapClient(updated);
  }

  async createReturn(ret: ReturnRecord): Promise<ReturnRecord> {
    const created = await this.db.taxReturn.create({
      data: {
        id: ret.id,
        clientId: ret.clientId,
        taxYear: ret.taxYear,
        filingStatus: ret.model.filingStatus,
        status: ret.status,
        includePennsylvania: ret.includePennsylvania,
        model: ret.model as object,
      },
    });
    return mapReturn({ ...created, latestSnapshotHash: ret.latestSnapshotHash });
  }
  async getReturn(id: string): Promise<ReturnRecord | undefined> {
    const ret = await this.db.taxReturn.findUnique({ where: { id } });
    if (!ret) return undefined;
    const latest = await this.db.calculationSnapshotRecord.findFirst({
      where: { returnId: id },
      orderBy: { createdAt: "desc" },
    });
    return mapReturn({ ...ret, latestSnapshotHash: latest?.snapshotHash });
  }
  async listReturns(filter?: {
    clientId?: string;
    status?: ReturnStatus;
  }): Promise<ReturnRecord[]> {
    const rows = await this.db.taxReturn.findMany({
      where: { clientId: filter?.clientId, status: filter?.status },
    });
    return rows.map((r: any) => mapReturn(r));
  }
  async updateReturn(id: string, patch: Partial<ReturnRecord>): Promise<ReturnRecord> {
    const updated = await this.db.taxReturn.update({
      where: { id },
      data: {
        ...("status" in patch && patch.status ? { status: patch.status } : {}),
        ...("model" in patch && patch.model
          ? { model: patch.model as object, filingStatus: patch.model.filingStatus }
          : {}),
      },
    });
    return mapReturn({ ...updated, latestSnapshotHash: patch.latestSnapshotHash });
  }
  async appendStatusEvent(event: StatusEventRecord): Promise<void> {
    await this.db.returnStatusEvent.create({
      data: {
        id: event.id,
        returnId: event.returnId,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        actorId: event.actorId,
        actorRole: event.actorRole,
        note: event.note,
      },
    });
  }
  async listStatusEvents(returnId: string): Promise<StatusEventRecord[]> {
    const rows = await this.db.returnStatusEvent.findMany({
      where: { returnId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((e: any) => ({
      id: e.id,
      returnId: e.returnId,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      actorId: e.actorId,
      actorRole: e.actorRole,
      note: e.note ?? undefined,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async saveSnapshot(snapshot: SnapshotRecord): Promise<void> {
    await this.db.calculationSnapshotRecord.upsert({
      where: {
        returnId_snapshotHash: { returnId: snapshot.returnId, snapshotHash: snapshot.snapshotHash },
      },
      create: {
        id: snapshot.id,
        returnId: snapshot.returnId,
        snapshotHash: snapshot.snapshotHash,
        taxYear: snapshot.taxYear,
        ruleVersion: snapshot.ruleVersion,
        payload: snapshot.payload as object,
        createdById: snapshot.createdById,
      },
      update: {},
    });
  }
  async getSnapshot(returnId: string, hash: string): Promise<SnapshotRecord | undefined> {
    const row = await this.db.calculationSnapshotRecord.findUnique({
      where: { returnId_snapshotHash: { returnId, snapshotHash: hash } },
    });
    if (!row) return undefined;
    return {
      id: row.id,
      returnId: row.returnId,
      snapshotHash: row.snapshotHash,
      taxYear: row.taxYear,
      ruleVersion: row.ruleVersion,
      payload: row.payload,
      createdById: row.createdById,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createSignature(signature: SignatureRecord): Promise<SignatureRecord> {
    await this.db.signature.create({
      data: {
        id: signature.id,
        returnId: signature.returnId,
        signerId: signature.signerId,
        role: signature.role,
        snapshotHash: signature.snapshotHash,
        payloadEncrypted: signature.payloadEncrypted,
        certificateHash: signature.certificateHash,
        ipAddress: signature.ipAddress,
        userAgent: signature.userAgent,
      },
    });
    return signature;
  }
  async listSignatures(returnId: string): Promise<SignatureRecord[]> {
    const rows = await this.db.signature.findMany({ where: { returnId } });
    return rows.map((s: any) => ({
      id: s.id,
      returnId: s.returnId,
      signerId: s.signerId,
      role: s.role,
      snapshotHash: s.snapshotHash,
      payloadEncrypted: s.payloadEncrypted,
      certificateHash: s.certificateHash,
      signedAt: s.signedAt.toISOString(),
      ipAddress: s.ipAddress ?? undefined,
      userAgent: s.userAgent ?? undefined,
      invalidatedAt: s.invalidatedAt?.toISOString(),
      invalidatedReason: s.invalidatedReason ?? undefined,
    }));
  }
  async updateSignature(id: string, patch: Partial<SignatureRecord>): Promise<SignatureRecord> {
    const updated = await this.db.signature.update({
      where: { id },
      data: {
        ...("invalidatedAt" in patch
          ? { invalidatedAt: patch.invalidatedAt ? new Date(patch.invalidatedAt) : null }
          : {}),
        ...("invalidatedReason" in patch ? { invalidatedReason: patch.invalidatedReason } : {}),
      },
    });
    return {
      id: updated.id,
      returnId: updated.returnId,
      signerId: updated.signerId,
      role: updated.role as "TAXPAYER" | "SPOUSE",
      snapshotHash: updated.snapshotHash,
      payloadEncrypted: updated.payloadEncrypted,
      certificateHash: updated.certificateHash,
      signedAt: updated.signedAt.toISOString(),
      invalidatedAt: updated.invalidatedAt?.toISOString(),
      invalidatedReason: updated.invalidatedReason ?? undefined,
    };
  }

  async createSubmission(submission: SubmissionRecord): Promise<SubmissionRecord> {
    await this.db.filingSubmission.create({
      data: {
        id: submission.id,
        returnId: submission.returnId,
        jurisdiction: submission.jurisdiction,
        provider: submission.provider,
        providerReturnId: submission.providerReturnId,
        providerSubmissionId: submission.providerSubmissionId,
        snapshotHash: submission.snapshotHash,
        state: submission.state,
        submittedById: submission.submittedById,
        correctsSubmissionId: submission.correctsSubmissionId,
      },
    });
    return submission;
  }
  private mapSubmission(s: any, ack?: any): SubmissionRecord {
    return {
      id: s.id,
      returnId: s.returnId,
      jurisdiction: s.jurisdiction,
      provider: s.provider,
      providerReturnId: s.providerReturnId,
      providerSubmissionId: s.providerSubmissionId,
      snapshotHash: s.snapshotHash,
      state: s.state,
      submittedById: s.submittedById,
      submittedAt: s.submittedAt.toISOString(),
      resolvedAt: s.resolvedAt?.toISOString(),
      correctsSubmissionId: s.correctsSubmissionId ?? undefined,
      acknowledgment: ack
        ? {
            accepted: ack.accepted,
            agencyTrackingId: ack.agencyTrackingId ?? undefined,
            rejections: ack.rejections as SubmissionRecord["acknowledgment"] extends infer _T
              ? Array<{ code: string; message: string; location?: string }>
              : never,
            acknowledgedAt: ack.acknowledgedAt.toISOString(),
          }
        : undefined,
    };
  }
  async getSubmission(id: string): Promise<SubmissionRecord | undefined> {
    const row = await this.db.filingSubmission.findUnique({
      where: { id },
      include: { acknowledgments: true },
    });
    return row ? this.mapSubmission(row, row.acknowledgments[0]) : undefined;
  }
  async findSubmissionBySnapshot(
    returnId: string,
    snapshotHash: string,
  ): Promise<SubmissionRecord | undefined> {
    const row = await this.db.filingSubmission.findFirst({
      where: { returnId, snapshotHash },
      include: { acknowledgments: true },
    });
    return row ? this.mapSubmission(row, row.acknowledgments[0]) : undefined;
  }
  async listSubmissions(returnId: string): Promise<SubmissionRecord[]> {
    const rows = await this.db.filingSubmission.findMany({
      where: { returnId },
      include: { acknowledgments: true },
      orderBy: { submittedAt: "asc" },
    });
    return rows.map((r: any) => this.mapSubmission(r, r.acknowledgments[0]));
  }
  async updateSubmission(id: string, patch: Partial<SubmissionRecord>): Promise<SubmissionRecord> {
    if (patch.acknowledgment) {
      await this.db.filingAcknowledgment.upsert({
        where: { submissionId: id },
        create: {
          submissionId: id,
          accepted: patch.acknowledgment.accepted,
          agencyTrackingId: patch.acknowledgment.agencyTrackingId,
          rejections: patch.acknowledgment.rejections as object[],
          acknowledgedAt: new Date(patch.acknowledgment.acknowledgedAt),
        },
        update: {},
      });
    }
    const updated = await this.db.filingSubmission.update({
      where: { id },
      data: {
        ...("state" in patch && patch.state ? { state: patch.state } : {}),
        ...("resolvedAt" in patch
          ? { resolvedAt: patch.resolvedAt ? new Date(patch.resolvedAt) : null }
          : {}),
      },
      include: { acknowledgments: true },
    });
    return this.mapSubmission(updated, updated.acknowledgments[0]);
  }

  async createDocument(doc: DocumentRecord): Promise<DocumentRecord> {
    await this.db.document.create({
      data: {
        id: doc.id,
        clientId: doc.clientId,
        returnId: doc.returnId,
        uploadedById: doc.uploadedById,
        category: doc.category,
        status: doc.status === "PENDING_VERIFICATION" ? "PENDING_VERIFICATION" : doc.status,
        filename: doc.filename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        storageKey: `inline/${doc.id}`,
        sha256: doc.sha256,
      },
    });
    return doc;
  }
  async getDocument(id: string): Promise<DocumentRecord | undefined> {
    const row = await this.db.document.findUnique({
      where: { id },
      include: { ocrResults: true, verifications: true },
    });
    if (!row) return undefined;
    return {
      id: row.id,
      clientId: row.clientId,
      returnId: row.returnId ?? undefined,
      uploadedById: row.uploadedById,
      category: row.category,
      status: row.status as DocumentRecord["status"],
      filename: row.filename,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      sha256: row.sha256,
      ocr: row.ocrResults[0]?.fields,
      verification: row.verifications[0]?.fields,
      createdAt: row.createdAt.toISOString(),
    };
  }
  async listDocuments(filter: { clientId?: string; returnId?: string }): Promise<DocumentRecord[]> {
    const rows = await this.db.document.findMany({
      where: { clientId: filter.clientId, returnId: filter.returnId },
    });
    return rows.map((row: any) => ({
      id: row.id,
      clientId: row.clientId,
      returnId: row.returnId ?? undefined,
      uploadedById: row.uploadedById,
      category: row.category,
      status: row.status,
      filename: row.filename,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      sha256: row.sha256,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  async updateDocument(id: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord> {
    if (patch.ocr) {
      const existing = await this.db.document.findUnique({ where: { id } });
      if (existing) {
        await this.db.ocrResultRecord.create({
          data: {
            documentId: id,
            engine: "configured",
            category: patch.category ?? existing.category,
            categoryConfidence: 1,
            fields: patch.ocr as object,
          },
        });
      }
    }
    const updated = await this.db.document.update({
      where: { id },
      data: {
        ...("status" in patch && patch.status ? { status: patch.status } : {}),
        ...("category" in patch && patch.category ? { category: patch.category } : {}),
      },
    });
    return (await this.getDocument(updated.id))!;
  }

  async appendAuditEvent(event: ChainedAuditEvent): Promise<void> {
    await this.db.auditEvent.create({
      data: {
        action: event.action,
        actorId: event.actorId,
        actorRole: event.actorRole,
        entityType: event.entityType,
        entityId: event.entityId,
        details: event.details as object | undefined,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        occurredAt: new Date(event.occurredAt),
        hash: event.hash,
        previousHash: event.previousHash,
      },
    });
  }
  async latestAuditEvent(): Promise<ChainedAuditEvent | undefined> {
    const row = await this.db.auditEvent.findFirst({ orderBy: { sequence: "desc" } });
    if (!row) return undefined;
    return {
      action: row.action as ChainedAuditEvent["action"],
      actorId: row.actorId,
      actorRole: row.actorRole,
      entityType: row.entityType ?? undefined,
      entityId: row.entityId ?? undefined,
      details: (row.details as ChainedAuditEvent["details"]) ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      occurredAt: row.occurredAt.toISOString(),
      hash: row.hash,
      previousHash: row.previousHash,
    };
  }
  async listAuditEvents(filter?: {
    entityId?: string;
    limit?: number;
  }): Promise<ChainedAuditEvent[]> {
    const rows = await this.db.auditEvent.findMany({
      where: filter?.entityId ? { entityId: filter.entityId } : undefined,
      orderBy: { sequence: "asc" },
      take: filter?.limit ?? 200,
    });
    return rows.map((row: any) => ({
      action: row.action,
      actorId: row.actorId,
      actorRole: row.actorRole,
      entityType: row.entityType ?? undefined,
      entityId: row.entityId ?? undefined,
      details: row.details ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      occurredAt: row.occurredAt.toISOString(),
      hash: row.hash,
      previousHash: row.previousHash,
    }));
  }
}
