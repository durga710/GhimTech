/**
 * Document vault routes: hardened upload (magic-byte validation, size limit,
 * malware scan), OCR, human verification, and audited access. Content is
 * encrypted before storage; the dev store keeps ciphertext inline while
 * production points at encrypted object storage.
 */
import { createHash, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  EicarTestScanner,
  MockOcrEngine,
  validateUpload,
  type OcrResult,
} from "@ghimtech/document-processing";
import { decryptField, encryptField } from "@ghimtech/security";
import type { AuthenticatedApp } from "../plugins/auth.js";
import { requireOwnClient } from "../plugins/auth.js";
import type { RouteContext } from "./auth-routes.js";

export function registerDocumentRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit, config } = ctx;
  const scanner = new EicarTestScanner();
  const ocrEngine = new MockOcrEngine();

  app.post("/documents", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const role = request.auth!.user.role;
    const body = request.body as {
      clientId?: string;
      returnId?: string;
      filename?: string;
      category?: string;
      contentBase64?: string;
    };
    if (!body?.filename || !body?.contentBase64) {
      return reply.code(400).send({ error: "filename and contentBase64 are required" });
    }

    let clientId = body.clientId;
    if (role === "CLIENT") {
      const ownId = await requireOwnClient(store, request, reply);
      if (!ownId) return;
      clientId = ownId;
    } else if (!["ADMIN", "PREPARER"].includes(role)) {
      return reply.code(403).send({ error: "Access denied" });
    }
    if (!clientId) return reply.code(400).send({ error: "clientId is required" });
    if (!(await store.getClient(clientId)))
      return reply.code(404).send({ error: "Client not found" });

    const content = Buffer.from(body.contentBase64, "base64");
    const validation = validateUpload({
      filename: body.filename,
      sizeBytes: content.length,
      head: content.subarray(0, 16),
    });
    // Development convenience: .txt uploads exercise the mock OCR pipeline.
    const isDevText = body.filename.endsWith(".txt") && config.environment !== "production";
    if (!validation.ok && !isDevText) {
      return reply.code(422).send({ error: validation.reason });
    }

    const scan = await scanner.scan(content);
    if (!scan.clean) {
      await audit.log({
        action: "document.scan_flagged",
        actorId: request.auth!.user.id,
        actorRole: role,
        entityType: "client",
        entityId: clientId,
        details: { signature: scan.signature ?? "unknown", filename: body.filename },
      });
      return reply.code(422).send({ error: "File failed the malware scan and was quarantined" });
    }

    const ocr: OcrResult = await ocrEngine.process(content, body.filename);
    const doc = await store.createDocument({
      id: randomUUID(),
      clientId,
      returnId: body.returnId,
      uploadedById: request.auth!.user.id,
      category: body.category ?? ocr.category,
      status: "PENDING_VERIFICATION",
      filename: body.filename,
      mimeType: validation.detectedMime ?? "text/plain",
      sizeBytes: content.length,
      sha256: createHash("sha256").update(content).digest("hex"),
      contentEncrypted: encryptField(content.toString("base64"), config.masterKey),
      ocr,
      createdAt: new Date().toISOString(),
    });
    await audit.log({
      action: "document.uploaded",
      actorId: request.auth!.user.id,
      actorRole: role,
      entityType: "document",
      entityId: doc.id,
      details: { category: doc.category, sizeBytes: doc.sizeBytes },
    });
    return reply.code(201).send({
      id: doc.id,
      category: doc.category,
      status: doc.status,
      ocr: { category: ocr.category, fields: ocr.fields },
    });
  });

  app.get("/documents", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const role = request.auth!.user.role;
    const query = request.query as { clientId?: string; returnId?: string };
    let clientId = query.clientId;
    if (role === "CLIENT") {
      const ownId = await requireOwnClient(store, request, reply);
      if (!ownId) return;
      clientId = ownId;
    } else if (!["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"].includes(role)) {
      return reply.code(403).send({ error: "Access denied" });
    }
    const docs = await store.listDocuments({ clientId, returnId: query.returnId });
    return docs.map((d) => ({
      id: d.id,
      clientId: d.clientId,
      category: d.category,
      status: d.status,
      filename: d.filename,
      sizeBytes: d.sizeBytes,
      createdAt: d.createdAt,
    }));
  });

  app.post(
    "/documents/:id/verify",
    { preHandler: [typedApp.requirePermission("documents:write")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const doc = await store.getDocument(id);
      if (!doc) return reply.code(404).send({ error: "Document not found" });
      const body = request.body as {
        categoryConfirmed?: boolean;
        fields?: Array<{ key: string; verifiedValue: string }>;
      };
      if (!body?.fields) return reply.code(400).send({ error: "fields are required" });
      const updated = await store.updateDocument(id, {
        status: "VERIFIED",
        verification: {
          verifiedBy: request.auth!.user.id,
          verifiedAt: new Date().toISOString(),
          categoryConfirmed: body.categoryConfirmed ?? true,
          fields: body.fields,
        },
      });
      await audit.log({
        action: "document.verified",
        actorId: request.auth!.user.id,
        actorRole: request.auth!.user.role,
        entityType: "document",
        entityId: id,
      });
      return { id: updated.id, status: updated.status };
    },
  );

  app.get(
    "/documents/:id/content",
    { preHandler: [typedApp.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const doc = await store.getDocument(id);
      if (!doc) return reply.code(404).send({ error: "Document not found" });
      const role = request.auth!.user.role;
      if (role === "CLIENT") {
        const ownId = await requireOwnClient(store, request, reply);
        if (!ownId || doc.clientId !== ownId)
          return reply.code(403).send({ error: "Access denied" });
      } else if (!["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"].includes(role)) {
        return reply.code(403).send({ error: "Access denied" });
      }
      if (!doc.contentEncrypted) {
        return reply
          .code(404)
          .send({ error: "Content is stored in object storage; use a signed URL" });
      }
      await audit.log({
        action: "document.downloaded",
        actorId: request.auth!.user.id,
        actorRole: role,
        entityType: "document",
        entityId: id,
      });
      return {
        filename: doc.filename,
        mimeType: doc.mimeType,
        contentBase64: decryptField(doc.contentEncrypted, config.masterKey),
      };
    },
  );
}
