/**
 * Return service: calculation, snapshotting, and lifecycle transitions with
 * every platform guard in one place.
 */
import { randomUUID } from "node:crypto";
import {
  assertTransition,
  hasBlockingDiagnostics,
  isLocked,
  type Diagnostic,
  type ReturnStatus,
  type Role,
  type TaxReturnModel,
} from "@ghimtech/tax-domain";
import { calculateFederal, type FederalCalculationResult } from "@ghimtech/tax-engine-federal";
import { calculatePennsylvania, type PaCalculationResult } from "@ghimtech/tax-engine-pennsylvania";
import { snapshotHash, type CalculationSnapshot } from "@ghimtech/forms-engine";
import type { AuditService } from "./audit-service.js";
import type { ReturnRecord, Store } from "../store/types.js";

export class ReturnServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "ReturnServiceError";
  }
}

export interface CalculationOutcome {
  snapshotHash: string;
  federal: FederalCalculationResult;
  pennsylvania?: PaCalculationResult;
  diagnostics: Diagnostic[];
}

export class ReturnService {
  constructor(
    private readonly store: Store,
    private readonly audit: AuditService,
  ) {}

  async getOrThrow(id: string): Promise<ReturnRecord> {
    const ret = await this.store.getReturn(id);
    if (!ret) throw new ReturnServiceError("Return not found", 404);
    return ret;
  }

  /** Update the model — only in editable states; invalidates stale signatures. */
  async updateModel(
    id: string,
    model: TaxReturnModel,
    actor: { id: string; role: Role },
  ): Promise<ReturnRecord> {
    const ret = await this.getOrThrow(id);
    if (isLocked(ret.status)) {
      throw new ReturnServiceError(
        `Return is locked in status ${ret.status} and cannot be edited`,
        409,
      );
    }
    const updated = await this.store.updateReturn(id, { model, latestSnapshotHash: undefined });
    // Any prior signatures are now stale by definition.
    for (const signature of await this.store.listSignatures(id)) {
      if (!signature.invalidatedAt) {
        await this.store.updateSignature(signature.id, {
          invalidatedAt: new Date().toISOString(),
          invalidatedReason: "Return data changed after signature",
        });
        await this.audit.log({
          action: "signature.invalidated",
          actorId: actor.id,
          actorRole: actor.role,
          entityType: "return",
          entityId: id,
        });
      }
    }
    await this.audit.log({
      action: "return.updated",
      actorId: actor.id,
      actorRole: actor.role,
      entityType: "return",
      entityId: id,
    });
    return updated;
  }

  /** Run both engines, persist the snapshot + diagnostics, return the outcome. */
  async calculate(id: string, actor: { id: string; role: Role }): Promise<CalculationOutcome> {
    const ret = await this.getOrThrow(id);
    const federal = calculateFederal(ret.model);
    const pennsylvania = ret.includePennsylvania ? calculatePennsylvania(ret.model) : undefined;
    const snapshot: CalculationSnapshot = { model: ret.model, federal, pennsylvania };
    const hash = snapshotHash(snapshot);
    const diagnostics = [...federal.diagnostics, ...(pennsylvania?.diagnostics ?? [])];

    await this.store.saveSnapshot({
      id: randomUUID(),
      returnId: id,
      snapshotHash: hash,
      taxYear: ret.taxYear,
      ruleVersion: federal.ruleVersion,
      payload: snapshot,
      createdById: actor.id,
      createdAt: new Date().toISOString(),
    });
    await this.store.updateReturn(id, { latestSnapshotHash: hash });
    await this.audit.log({
      action: "return.calculated",
      actorId: actor.id,
      actorRole: actor.role,
      entityType: "return",
      entityId: id,
      details: { snapshotHash: hash, ruleVersion: federal.ruleVersion },
    });
    return { snapshotHash: hash, federal, pennsylvania, diagnostics };
  }

  async latestSnapshot(ret: ReturnRecord): Promise<CalculationSnapshot | undefined> {
    if (!ret.latestSnapshotHash) return undefined;
    const record = await this.store.getSnapshot(ret.id, ret.latestSnapshotHash);
    return record?.payload as CalculationSnapshot | undefined;
  }

  async currentDiagnostics(ret: ReturnRecord): Promise<Diagnostic[]> {
    const snapshot = await this.latestSnapshot(ret);
    if (!snapshot) return [];
    return [...snapshot.federal.diagnostics, ...(snapshot.pennsylvania?.diagnostics ?? [])];
  }

  /**
   * Transition the return. Beyond the state machine itself, enforces:
   *   - a calculation snapshot exists before entering review
   *   - reviewer separation (approver ≠ the preparer who sent it to review)
   *   - no blocking diagnostics on the road to filing
   *   - SIGNED is only reachable through the signature service
   *   - a valid signature exists before READY_TO_EFILE
   */
  async transition(
    id: string,
    toStatus: ReturnStatus,
    actor: { id: string; role: Role | "SYSTEM" },
    options: { note?: string; viaSignatureService?: boolean } = {},
  ): Promise<ReturnRecord> {
    const ret = await this.getOrThrow(id);
    assertTransition(ret.status, toStatus, actor.role);

    if (toStatus === "SIGNED" && !options.viaSignatureService) {
      throw new ReturnServiceError(
        "Returns are signed through the signature endpoint, not a direct status change",
        400,
      );
    }

    if (toStatus === "READY_FOR_REVIEWER" || toStatus === "PREPARER_REVIEWED") {
      if (!ret.latestSnapshotHash) {
        throw new ReturnServiceError("Run calculations before sending a return to review", 409);
      }
    }

    if (toStatus === "APPROVED") {
      const events = await this.store.listStatusEvents(id);
      const sentToReview = [...events].reverse().find((e) => e.toStatus === "READY_FOR_REVIEWER");
      if (sentToReview && sentToReview.actorId === actor.id && actor.role !== "ADMIN") {
        throw new ReturnServiceError(
          "Reviewer separation: the user who sent the return to review cannot approve it",
          403,
        );
      }
    }

    if (toStatus === "AWAITING_CLIENT_REVIEW" || toStatus === "READY_TO_EFILE") {
      const diagnostics = await this.currentDiagnostics(ret);
      if (hasBlockingDiagnostics(diagnostics)) {
        throw new ReturnServiceError(
          "Return has blocking diagnostics and cannot proceed toward filing",
          409,
        );
      }
    }

    if (toStatus === "READY_TO_EFILE") {
      const signatures = await this.store.listSignatures(id);
      const valid = signatures.find(
        (s) => !s.invalidatedAt && s.snapshotHash === ret.latestSnapshotHash,
      );
      if (!valid) {
        throw new ReturnServiceError(
          "A valid signature matching the current calculation is required before filing",
          409,
        );
      }
    }

    const previous = ret.status;
    const updated = await this.store.updateReturn(id, { status: toStatus });
    await this.store.appendStatusEvent({
      id: randomUUID(),
      returnId: id,
      fromStatus: previous,
      toStatus,
      actorId: actor.id,
      actorRole: actor.role,
      note: options.note,
      createdAt: new Date().toISOString(),
    });
    await this.audit.log({
      action: "return.status_changed",
      actorId: actor.id,
      actorRole: actor.role,
      entityType: "return",
      entityId: id,
      details: { from: previous, to: toStatus, note: options.note ?? null },
    });
    return updated;
  }
}
