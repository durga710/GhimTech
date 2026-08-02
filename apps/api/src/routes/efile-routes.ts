/**
 * E-file routes. The submission path enforces, in order: correct lifecycle
 * status, no blocking diagnostics, a valid signature matching the current
 * snapshot, provider validation, then transmission — with each step audited
 * and reflected in the return status. Duplicate submissions are impossible
 * (registry keyed on return + snapshot hash).
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  DuplicateSubmissionError,
  EFileOrchestrator,
  SubmissionBlockedError,
  explainRejection,
  type SubmissionRegistry,
} from "@ghimtech/efile-core";
import { createProvider } from "@ghimtech/efile-providers";
import { decryptField } from "@ghimtech/security";
import type { AuthenticatedApp } from "../plugins/auth.js";
import { ReturnService, ReturnServiceError } from "../services/return-service.js";
import type { Store } from "../store/types.js";
import type { RouteContext } from "./auth-routes.js";

class StoreSubmissionRegistry implements SubmissionRegistry {
  constructor(private readonly store: Store) {}
  async findBySnapshot(returnId: string, snapshotHash: string): Promise<string | undefined> {
    const existing = await this.store.findSubmissionBySnapshot(returnId, snapshotHash);
    // A rejected submission may be corrected and resubmitted; anything else
    // with the same snapshot is a duplicate.
    if (!existing || existing.state === "REJECTED") return undefined;
    return existing.providerSubmissionId;
  }
  async record(): Promise<void> {
    // Submissions are persisted as SubmissionRecords by the route handler.
  }
}

export function registerEfileRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit, config } = ctx;
  const service = new ReturnService(store, audit);
  const provider = createProvider(config.efileProvider);
  const orchestrator = new EFileOrchestrator(provider, new StoreSubmissionRegistry(store));

  app.post(
    "/returns/:id/efile",
    { preHandler: [typedApp.requirePermission("efile:submit")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const actor = { id: request.auth!.user.id, role: request.auth!.user.role };
      try {
        let ret = await service.getOrThrow(id);
        const resubmitting = ret.status === "RESUBMISSION_READY";
        if (ret.status !== "READY_TO_EFILE" && !resubmitting) {
          return reply.code(409).send({
            error: `Return must be READY_TO_EFILE or RESUBMISSION_READY (is ${ret.status})`,
          });
        }
        const snapshot = await service.latestSnapshot(ret);
        if (!snapshot || !ret.latestSnapshotHash) {
          return reply.code(409).send({ error: "No calculation snapshot" });
        }
        const latestHash = ret.latestSnapshotHash;
        const diagnostics = await service.currentDiagnostics(ret);
        const signatures = await store.listSignatures(id);
        const signature = signatures.find((s) => !s.invalidatedAt && s.snapshotHash === latestHash);
        if (!signature) {
          return reply
            .code(409)
            .send({ error: "No valid signature for the current return version" });
        }

        // Decrypt the TIN only here, at the transmission boundary.
        const client = await store.getClient(ret.clientId);
        if (!client) return reply.code(404).send({ error: "Client not found" });
        const tin = decryptField(client.tinEncrypted, config.masterKey);

        if (!resubmitting) {
          ret = await service.transition(id, "VALIDATING", { id: "SYSTEM", role: "SYSTEM" });
        }

        const providerTaxpayer = await provider.createTaxpayer({
          externalClientRef: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          tin,
          dateOfBirth: client.dateOfBirth,
          email: client.email,
        });
        const providerReturn = await provider.createReturn({
          providerTaxpayerId: providerTaxpayer.providerTaxpayerId,
          taxYear: ret.taxYear,
          jurisdictions: ret.includePennsylvania ? ["FEDERAL", "PENNSYLVANIA"] : ["FEDERAL"],
          returnModel: ret.model,
        });

        const validation = await provider.validateReturn(providerReturn.providerReturnId);
        await audit.log({
          action: "efile.validated",
          actorId: actor.id,
          actorRole: actor.role,
          entityType: "return",
          entityId: id,
          details: { valid: validation.valid, issues: validation.issues.length },
        });
        if (!validation.valid) {
          if (!resubmitting) {
            await service.transition(id, "VALIDATION_FAILED", { id: "SYSTEM", role: "SYSTEM" });
          }
          return reply
            .code(422)
            .send({ error: "Provider validation failed", issues: validation.issues });
        }

        const providerAuth = await provider.generateAuthorization(providerReturn.providerReturnId);
        const authorization = {
          authorizationId: providerAuth.authorizationId,
          signedSnapshotHash: signature.snapshotHash,
          signedAt: signature.signedAt,
        };

        let receipt;
        if (resubmitting) {
          const previous = (await store.listSubmissions(id))
            .filter((s) => s.state === "REJECTED")
            .at(-1);
          if (!previous)
            return reply.code(409).send({ error: "No rejected submission to correct" });
          receipt = await orchestrator.resubmit(previous.providerSubmissionId, {
            returnId: id,
            providerReturnId: providerReturn.providerReturnId,
            diagnostics,
            authorization,
            currentSnapshotHash: latestHash,
            correction: {
              returnModel: ret.model,
              addressedRejectionCodes: previous.acknowledgment?.rejections.map((r) => r.code) ?? [],
              authorization,
            },
          });
          await store.createSubmission({
            id: randomUUID(),
            returnId: id,
            jurisdiction: "FEDERAL",
            provider: provider.name,
            providerReturnId: providerReturn.providerReturnId,
            providerSubmissionId: receipt.submissionId,
            snapshotHash: latestHash,
            state: "TRANSMITTED",
            submittedById: actor.id,
            submittedAt: new Date().toISOString(),
            correctsSubmissionId: previous.id,
          });
          await service.transition(id, "RESUBMITTED", { id: "SYSTEM", role: "SYSTEM" });
          await service.transition(id, "ACKNOWLEDGMENT_PENDING", { id: "SYSTEM", role: "SYSTEM" });
          await audit.log({
            action: "efile.resubmitted",
            actorId: actor.id,
            actorRole: actor.role,
            entityType: "return",
            entityId: id,
            details: { submissionId: receipt.submissionId },
          });
        } else {
          await service.transition(id, "QUEUED_FOR_TRANSMISSION", { id: "SYSTEM", role: "SYSTEM" });
          await service.transition(id, "TRANSMITTING", { id: "SYSTEM", role: "SYSTEM" });
          receipt = await orchestrator.submit({
            returnId: id,
            providerReturnId: providerReturn.providerReturnId,
            diagnostics,
            authorization,
            currentSnapshotHash: latestHash,
          });
          await store.createSubmission({
            id: randomUUID(),
            returnId: id,
            jurisdiction: "FEDERAL",
            provider: provider.name,
            providerReturnId: providerReturn.providerReturnId,
            providerSubmissionId: receipt.submissionId,
            snapshotHash: latestHash,
            state: "TRANSMITTED",
            submittedById: actor.id,
            submittedAt: new Date().toISOString(),
          });
          await service.transition(id, "TRANSMITTED", { id: "SYSTEM", role: "SYSTEM" });
          await service.transition(id, "ACKNOWLEDGMENT_PENDING", { id: "SYSTEM", role: "SYSTEM" });
          await audit.log({
            action: "efile.transmitted",
            actorId: actor.id,
            actorRole: actor.role,
            entityType: "return",
            entityId: id,
            details: { submissionId: receipt.submissionId, provider: provider.name },
          });
        }
        return reply.code(202).send({
          submissionId: receipt.submissionId,
          state: receipt.state,
          provider: provider.name,
        });
      } catch (err) {
        const e = err as Error;
        if (e instanceof SubmissionBlockedError) return reply.code(409).send({ error: e.message });
        if (e instanceof DuplicateSubmissionError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof ReturnServiceError)
          return reply.code(e.statusCode).send({ error: e.message });
        if (e.name === "ProviderNotConfiguredError") {
          return reply.code(503).send({ error: e.message });
        }
        throw err;
      }
    },
  );

  /** Poll the provider for the acknowledgment; idempotent. */
  app.post(
    "/returns/:id/efile/poll",
    { preHandler: [typedApp.requirePermission("efile:read")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ret = await store.getReturn(id);
      if (!ret) return reply.code(404).send({ error: "Return not found" });
      const submissions = await store.listSubmissions(id);
      const pending = submissions.filter(
        (s) => s.state === "TRANSMITTED" || s.state === "QUEUED" || s.state === "TRANSMITTING",
      );
      if (pending.length === 0) {
        return { status: ret.status, submissions };
      }
      for (const submission of pending) {
        const ack = await orchestrator.pollAcknowledgment(submission.providerSubmissionId);
        if (!ack) continue;
        await store.updateSubmission(submission.id, {
          state: ack.accepted ? "ACCEPTED" : "REJECTED",
          resolvedAt: new Date().toISOString(),
          acknowledgment: {
            accepted: ack.accepted,
            agencyTrackingId: ack.agencyTrackingId,
            rejections: ack.rejections.map((r) => ({
              ...r,
              ...explainRejection(r.code),
            })),
            acknowledgedAt: ack.acknowledgedAt,
          },
        });
        await audit.log({
          action: ack.accepted ? "efile.acknowledged" : "efile.rejected",
          actorId: "SYSTEM",
          actorRole: "SYSTEM",
          entityType: "return",
          entityId: id,
          details: {
            submissionId: submission.providerSubmissionId,
            accepted: ack.accepted,
            trackingId: ack.agencyTrackingId ?? null,
          },
        });
        if (ret.status === "ACKNOWLEDGMENT_PENDING") {
          if (ack.accepted) {
            await new ReturnService(store, audit).transition(id, "ACCEPTED", {
              id: "SYSTEM",
              role: "SYSTEM",
            });
          } else {
            const svc = new ReturnService(store, audit);
            await svc.transition(id, "REJECTED", { id: "SYSTEM", role: "SYSTEM" });
            await svc.transition(id, "CORRECTION_REQUIRED", { id: "SYSTEM", role: "SYSTEM" });
          }
        }
      }
      const updatedReturn = await store.getReturn(id);
      return { status: updatedReturn!.status, submissions: await store.listSubmissions(id) };
    },
  );

  app.get(
    "/returns/:id/submissions",
    { preHandler: [typedApp.requirePermission("efile:read")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ret = await store.getReturn(id);
      if (!ret) return reply.code(404).send({ error: "Return not found" });
      return store.listSubmissions(id);
    },
  );
}
