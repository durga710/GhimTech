/**
 * Return routes: creation, model editing, calculation, lifecycle transitions,
 * review packages, and signature capture.
 */
import { createHash, randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { buildReturnPackage, renderFormHtml } from "@ghimtech/forms-engine";
import { encryptField } from "@ghimtech/security";
import {
  allowedTransitions,
  emptyReturnModel,
  type Role,
  type TaxReturnModel,
} from "@ghimtech/tax-domain";
import {
  createReturnSchema,
  signatureCaptureSchema,
  statusTransitionSchema,
} from "@ghimtech/validation";
import type { AuthenticatedApp } from "../plugins/auth.js";
import { requireOwnClient } from "../plugins/auth.js";
import { ReturnService, ReturnServiceError } from "../services/return-service.js";
import type { ReturnRecord } from "../store/types.js";
import type { RouteContext } from "./auth-routes.js";

function returnView(ret: ReturnRecord, role: Role) {
  return {
    id: ret.id,
    clientId: ret.clientId,
    taxYear: ret.taxYear,
    status: ret.status,
    includePennsylvania: ret.includePennsylvania,
    latestSnapshotHash: ret.latestSnapshotHash,
    allowedTransitions: allowedTransitions(ret.status, role),
    model: ret.model,
    createdAt: ret.createdAt,
    updatedAt: ret.updatedAt,
  };
}

export function registerReturnRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit, config } = ctx;
  const service = new ReturnService(store, audit);

  async function guardClientScope(
    request: FastifyRequest,
    reply: FastifyReply,
    ret: ReturnRecord,
  ): Promise<boolean> {
    if (request.auth!.user.role !== "CLIENT") return true;
    const ownId = await requireOwnClient(store, request, reply);
    if (!ownId) return false;
    if (ret.clientId !== ownId) {
      reply.code(403).send({ error: "Access denied" });
      return false;
    }
    return true;
  }

  app.post(
    "/returns",
    { preHandler: [typedApp.requirePermission("returns:write")] },
    async (request, reply) => {
      const body = createReturnSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
      const client = await store.getClient(body.data.clientId);
      if (!client) return reply.code(404).send({ error: "Client not found" });

      const model = emptyReturnModel({
        returnId: randomUUID(),
        taxYear: body.data.taxYear,
        filingStatus: body.data.filingStatus,
        taxpayer: {
          name: { firstName: client.firstName, lastName: client.lastName },
          ssnRef: `client:${client.id}`,
          ssnLast4: client.tinLast4,
          dateOfBirth: client.dateOfBirth,
          isBlind: false,
        },
        address: client.address,
      });
      if (body.data.includePennsylvania) {
        model.pennsylvania = {
          residencyStatus: "FULL_YEAR_RESIDENT",
          claimTaxForgiveness: false,
          spEligibilityOtherIncome: 0,
        };
      }
      try {
        const ret = await store.createReturn({
          id: model.returnId,
          clientId: client.id,
          taxYear: body.data.taxYear,
          status: "DRAFT",
          includePennsylvania: body.data.includePennsylvania,
          model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await audit.log({
          action: "return.created",
          actorId: request.auth!.user.id,
          actorRole: request.auth!.user.role,
          entityType: "return",
          entityId: ret.id,
          details: { taxYear: ret.taxYear, clientId: client.id },
        });
        return reply.code(201).send(returnView(ret, request.auth!.user.role));
      } catch (err) {
        return reply.code(409).send({ error: (err as Error).message });
      }
    },
  );

  app.get("/returns", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const role = request.auth!.user.role;
    const query = request.query as { clientId?: string; status?: string };
    if (role === "CLIENT") {
      const ownId = await requireOwnClient(store, request, reply);
      if (!ownId) return;
      const returns = await store.listReturns({ clientId: ownId });
      return returns.map((r) => returnView(r, role));
    }
    if (!["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"].includes(role)) {
      return reply.code(403).send({ error: "Access denied" });
    }
    const returns = await store.listReturns({
      clientId: query.clientId,
      status: query.status as ReturnRecord["status"] | undefined,
    });
    return returns.map((r) => returnView(r, role));
  });

  app.get("/returns/:id", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const ret = await service.getOrThrow(id);
      if (!(await guardClientScope(request, reply, ret))) return;
      return returnView(ret, request.auth!.user.role);
    } catch (err) {
      if (err instanceof ReturnServiceError)
        return reply.code(err.statusCode).send({ error: err.message });
      throw err;
    }
  });

  app.put(
    "/returns/:id/model",
    { preHandler: [typedApp.requirePermission("returns:write")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const model = request.body as TaxReturnModel;
        if (!model || model.returnId !== id) {
          return reply.code(400).send({ error: "Model returnId must match the URL" });
        }
        const updated = await service.updateModel(id, model, {
          id: request.auth!.user.id,
          role: request.auth!.user.role,
        });
        return returnView(updated, request.auth!.user.role);
      } catch (err) {
        if (err instanceof ReturnServiceError)
          return reply.code(err.statusCode).send({ error: err.message });
        throw err;
      }
    },
  );

  app.post(
    "/returns/:id/calculate",
    { preHandler: [typedApp.requirePermission("returns:calculate")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const outcome = await service.calculate(id, {
          id: request.auth!.user.id,
          role: request.auth!.user.role,
        });
        return outcome;
      } catch (err) {
        if (err instanceof ReturnServiceError)
          return reply.code(err.statusCode).send({ error: err.message });
        if ((err as Error).name === "UnsupportedTaxYearError") {
          return reply.code(422).send({ error: (err as Error).message });
        }
        throw err;
      }
    },
  );

  app.post(
    "/returns/:id/transition",
    { preHandler: [typedApp.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = statusTransitionSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
      try {
        const ret = await service.getOrThrow(id);
        if (!(await guardClientScope(request, reply, ret))) return;
        const updated = await service.transition(
          id,
          body.data.toStatus,
          {
            id: request.auth!.user.id,
            role: request.auth!.user.role,
          },
          { note: body.data.note },
        );
        return returnView(updated, request.auth!.user.role);
      } catch (err) {
        const e = err as Error;
        if (e instanceof ReturnServiceError)
          return reply.code(e.statusCode).send({ error: e.message });
        if (e.name === "IllegalTransitionError") return reply.code(409).send({ error: e.message });
        if (e.name === "TransitionPermissionError")
          return reply.code(403).send({ error: e.message });
        throw err;
      }
    },
  );

  app.get(
    "/returns/:id/history",
    { preHandler: [typedApp.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ret = await store.getReturn(id);
      if (!ret) return reply.code(404).send({ error: "Return not found" });
      if (!(await guardClientScope(request, reply, ret))) return;
      return store.listStatusEvents(id);
    },
  );

  app.get(
    "/returns/:id/package",
    { preHandler: [typedApp.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { watermark?: string; format?: string };
      const ret = await store.getReturn(id);
      if (!ret) return reply.code(404).send({ error: "Return not found" });
      if (!(await guardClientScope(request, reply, ret))) return;
      const snapshot = await service.latestSnapshot(ret);
      if (!snapshot) return reply.code(409).send({ error: "Run calculations first" });

      const role = request.auth!.user.role;
      const watermark =
        ret.status === "ACCEPTED" || ret.status === "ARCHIVED"
          ? "CLIENT_COPY"
          : role === "CLIENT"
            ? "CLIENT_COPY"
            : ((query.watermark as "DRAFT" | "REVIEW_COPY") ?? "DRAFT");
      const pkg = buildReturnPackage(snapshot, watermark);
      await audit.log({
        action: "return.viewed",
        actorId: request.auth!.user.id,
        actorRole: role,
        entityType: "return",
        entityId: id,
        details: { package: watermark },
      });
      if (query.format === "html") {
        reply.type("text/html");
        return pkg.documents
          .map(renderFormHtml)
          .join('\n<div style="page-break-after: always"></div>\n');
      }
      return pkg;
    },
  );

  // ---- Signature capture ----
  app.post(
    "/returns/:id/signatures",
    { preHandler: [typedApp.requirePermission("returns:sign")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = signatureCaptureSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
      try {
        const ret = await service.getOrThrow(id);
        if (!(await guardClientScope(request, reply, ret))) return;
        if (ret.status !== "AWAITING_SIGNATURE") {
          return reply
            .code(409)
            .send({ error: `Return is not awaiting signature (status ${ret.status})` });
        }
        if (!ret.latestSnapshotHash || body.data.reviewedSnapshotHash !== ret.latestSnapshotHash) {
          return reply.code(409).send({
            error:
              "The reviewed return version does not match the current calculation — review again before signing",
          });
        }
        const signedAt = new Date().toISOString();
        const certificateHash = createHash("sha256")
          .update(`${request.auth!.user.id}|${ret.latestSnapshotHash}|${signedAt}`)
          .digest("hex");
        const signature = await store.createSignature({
          id: randomUUID(),
          returnId: id,
          signerId: request.auth!.user.id,
          role: "TAXPAYER",
          snapshotHash: ret.latestSnapshotHash,
          payloadEncrypted: encryptField(
            JSON.stringify({ signatureText: body.data.signatureText, consent: true, signedAt }),
            config.masterKey,
          ),
          certificateHash,
          signedAt,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        });
        await audit.log({
          action: "signature.captured",
          actorId: request.auth!.user.id,
          actorRole: request.auth!.user.role,
          entityType: "return",
          entityId: id,
          details: { certificateHash, snapshotHash: ret.latestSnapshotHash },
        });
        const updated = await service.transition(
          id,
          "SIGNED",
          { id: request.auth!.user.id, role: request.auth!.user.role },
          { viaSignatureService: true },
        );
        return reply.code(201).send({
          signatureId: signature.id,
          certificateHash,
          status: updated.status,
        });
      } catch (err) {
        const e = err as Error;
        if (e instanceof ReturnServiceError)
          return reply.code(e.statusCode).send({ error: e.message });
        if (e.name === "TransitionPermissionError")
          return reply.code(403).send({ error: e.message });
        throw err;
      }
    },
  );

  app.get(
    "/returns/:id/signatures",
    { preHandler: [typedApp.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ret = await store.getReturn(id);
      if (!ret) return reply.code(404).send({ error: "Return not found" });
      if (!(await guardClientScope(request, reply, ret))) return;
      const signatures = await store.listSignatures(id);
      return signatures.map((s) => ({
        id: s.id,
        signerId: s.signerId,
        role: s.role,
        snapshotHash: s.snapshotHash,
        certificateHash: s.certificateHash,
        signedAt: s.signedAt,
        invalidatedAt: s.invalidatedAt,
        invalidatedReason: s.invalidatedReason,
      }));
    },
  );
}
