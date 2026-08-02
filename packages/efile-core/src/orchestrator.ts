/**
 * The e-file orchestrator: the only path through which a return reaches a
 * provider. It enforces the platform's non-negotiables independently of the
 * API layer:
 *
 *   - no submission with blocking diagnostics
 *   - no submission without a valid, current signature authorization
 *   - duplicate-submission protection keyed on the signed snapshot hash
 *   - idempotent acknowledgment handling
 */
import type { Diagnostic } from "@ghimtech/tax-domain";
import { hasBlockingDiagnostics } from "@ghimtech/tax-domain";
import {
  DuplicateSubmissionError,
  type CorrectedReturnInput,
  type EFileAcknowledgment,
  type EFileProvider,
  type EFileSubmissionReceipt,
  type SubmissionAuthorization,
} from "./types.js";

export interface SubmissionRegistry {
  /** Find a prior submission for this return + snapshot hash. */
  findBySnapshot(returnId: string, snapshotHash: string): Promise<string | undefined>;
  /** Record a submission id for this return + snapshot hash. */
  record(returnId: string, snapshotHash: string, submissionId: string): Promise<void>;
}

/** Simple in-memory registry — the API app persists this in Postgres. */
export class InMemorySubmissionRegistry implements SubmissionRegistry {
  private readonly entries = new Map<string, string>();
  async findBySnapshot(returnId: string, snapshotHash: string): Promise<string | undefined> {
    return this.entries.get(`${returnId}:${snapshotHash}`);
  }
  async record(returnId: string, snapshotHash: string, submissionId: string): Promise<void> {
    this.entries.set(`${returnId}:${snapshotHash}`, submissionId);
  }
}

export class SubmissionBlockedError extends Error {
  constructor(
    message: string,
    public readonly diagnostics: Diagnostic[] = [],
  ) {
    super(message);
    this.name = "SubmissionBlockedError";
  }
}

export interface SubmitParams {
  returnId: string;
  providerReturnId: string;
  diagnostics: Diagnostic[];
  authorization: SubmissionAuthorization;
  /** Hash of the current return snapshot; must equal the signed hash. */
  currentSnapshotHash: string;
}

export class EFileOrchestrator {
  constructor(
    private readonly provider: EFileProvider,
    private readonly registry: SubmissionRegistry,
  ) {}

  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Submit a return. Throws SubmissionBlockedError when preconditions fail and
   * DuplicateSubmissionError when this exact snapshot was already submitted.
   */
  async submit(params: SubmitParams): Promise<EFileSubmissionReceipt> {
    if (hasBlockingDiagnostics(params.diagnostics)) {
      throw new SubmissionBlockedError(
        "Return has unresolved blocking diagnostics and cannot be filed",
        params.diagnostics.filter((d) => d.severity === "ERROR"),
      );
    }
    if (params.authorization.signedSnapshotHash !== params.currentSnapshotHash) {
      throw new SubmissionBlockedError(
        "The return changed after it was signed — the signature is invalid and the client must re-sign",
      );
    }
    const existing = await this.registry.findBySnapshot(
      params.returnId,
      params.currentSnapshotHash,
    );
    if (existing) {
      throw new DuplicateSubmissionError(existing);
    }
    const receipt = await this.provider.submitReturn(params.providerReturnId, params.authorization);
    await this.registry.record(params.returnId, params.currentSnapshotHash, receipt.submissionId);
    return receipt;
  }

  /**
   * Resubmit after a rejection. The corrected snapshot must carry a fresh
   * authorization; the original submission id links the resubmission history.
   */
  async resubmit(
    originalSubmissionId: string,
    params: SubmitParams & { correction: CorrectedReturnInput },
  ): Promise<EFileSubmissionReceipt> {
    if (hasBlockingDiagnostics(params.diagnostics)) {
      throw new SubmissionBlockedError(
        "Corrected return still has blocking diagnostics",
        params.diagnostics.filter((d) => d.severity === "ERROR"),
      );
    }
    if (params.authorization.signedSnapshotHash !== params.currentSnapshotHash) {
      throw new SubmissionBlockedError("Corrected return requires a fresh signature");
    }
    const existing = await this.registry.findBySnapshot(
      params.returnId,
      params.currentSnapshotHash,
    );
    if (existing) {
      throw new DuplicateSubmissionError(existing);
    }
    const receipt = await this.provider.resubmitReturn(originalSubmissionId, params.correction);
    await this.registry.record(params.returnId, params.currentSnapshotHash, receipt.submissionId);
    return receipt;
  }

  /** Poll for the acknowledgment. Safe to call repeatedly (idempotent). */
  async pollAcknowledgment(submissionId: string): Promise<EFileAcknowledgment | undefined> {
    const status = await this.provider.getSubmissionStatus(submissionId);
    if (status.state !== "ACCEPTED" && status.state !== "REJECTED") return undefined;
    return this.provider.getAcknowledgment(submissionId);
  }
}
