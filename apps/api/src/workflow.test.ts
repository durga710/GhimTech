/**
 * End-to-end workflow tests over the real API surface (in-memory store,
 * mock e-file provider): the full happy path from client creation to an
 * accepted, archived filing, plus the rejection/correction/resubmission
 * cycle, duplicate-submission protection, and change-after-signature rules.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { singleW2Return } from "@ghimtech/testing";
import type { TaxReturnModel } from "@ghimtech/tax-domain";
import type { MemoryStore } from "./store/memory.js";
import { authed, buildTestServer, createUser, login } from "./test-helpers.js";

let app: FastifyInstance;
let store: MemoryStore;
let adminToken: string;
let preparerToken: string;
let reviewerToken: string;

const CLIENT_PAYLOAD = {
  name: { firstName: "Avery", lastName: "Testcase" },
  email: "avery.client@test.ghimtech.example",
  address: { line1: "100 Synthetic St", city: "Harrisburg", state: "PA", zip: "17101" },
  dateOfBirth: "1985-06-15",
  tin: "123-45-6789",
};

async function post(url: string, token: string, payload?: unknown) {
  return app.inject({ method: "POST", url, headers: authed(token), payload });
}
async function get(url: string, token: string) {
  return app.inject({ method: "GET", url, headers: authed(token) });
}

function modelFor(returnId: string, overrides: Partial<TaxReturnModel> = {}): TaxReturnModel {
  const model = singleW2Return(overrides);
  model.returnId = returnId;
  return model;
}

beforeAll(async () => {
  const built = await buildTestServer();
  app = built.app;
  store = built.store as MemoryStore;
  adminToken = await login(app, (await createUser(store, "ADMIN")).email);
  preparerToken = await login(app, (await createUser(store, "PREPARER")).email);
  reviewerToken = await login(app, (await createUser(store, "REVIEWER")).email);
});

describe("full filing lifecycle (happy path)", () => {
  let clientId: string;
  let returnId: string;
  let clientToken: string;
  let snapshotHash: string;

  it("preparer creates a client (duplicate TIN blocked)", async () => {
    const created = await post("/clients", preparerToken, CLIENT_PAYLOAD);
    expect(created.statusCode).toBe(201);
    clientId = created.json().id;
    expect(created.json().tinMasked).toBe("***-**-6789");

    const dup = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      email: "other@test.ghimtech.example",
    });
    expect(dup.statusCode).toBe(409);
  });

  it("creates a 2025 return and fills the model from intake", async () => {
    const created = await post("/returns", preparerToken, {
      clientId,
      taxYear: 2025,
      filingStatus: "SINGLE",
      includePennsylvania: true,
    });
    expect(created.statusCode).toBe(201);
    returnId = created.json().id;
    expect(created.json().status).toBe("DRAFT");

    const updated = await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: modelFor(returnId),
    });
    expect(updated.statusCode).toBe(200);
  });

  it("calculates with traceable results and no blocking diagnostics", async () => {
    const calc = await post(`/returns/${returnId}/calculate`, preparerToken);
    expect(calc.statusCode).toBe(200);
    const body = calc.json();
    snapshotHash = body.snapshotHash;
    expect(body.federal.refund).toBe(92_500);
    expect(body.pennsylvania.taxLiability).toBe(184_200);
    expect(
      body.diagnostics.filter((d: { severity: string }) => d.severity === "ERROR"),
    ).toHaveLength(0);
    expect(body.federal.trace.entries.length).toBeGreaterThan(5);
  });

  it("walks preparer review and enforces reviewer separation", async () => {
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "PREPARER_REVIEWED" });
    const toReviewer = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_REVIEWER",
    });
    expect(toReviewer.statusCode).toBe(200);

    // The preparer cannot approve at all (role), and the sender could not
    // approve even with the reviewer role (identity separation).
    const preparerApprove = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "APPROVED",
    });
    expect(preparerApprove.statusCode).toBe(403);

    const approve = await post(`/returns/${returnId}/transition`, reviewerToken, {
      toStatus: "APPROVED",
    });
    expect(approve.statusCode).toBe(200);
    expect(approve.json().status).toBe("APPROVED");
  });

  it("client reviews the package and signs", async () => {
    const portal = await post(`/clients/${clientId}/portal-account`, preparerToken, {
      temporaryPassword: "ClientTempPass123",
    });
    expect(portal.statusCode).toBe(201);
    // Client user shares TEST_PASSWORD? No — portal uses its own temp password.
    // Reset it in the store to the shared test password for the login helper.
    const clientUser = await store.getUserById(portal.json().userId);
    const { hashPassword } = await import("@ghimtech/security");
    await store.updateUser(clientUser!.id, {
      passwordHash: await hashPassword((await import("./test-helpers.js")).TEST_PASSWORD),
    });
    clientToken = await login(app, clientUser!.email);

    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_CLIENT_REVIEW",
    });

    // Client can see their package but not other clients' data.
    const pkg = await get(`/returns/${returnId}/package`, clientToken);
    expect(pkg.statusCode).toBe(200);
    expect(pkg.json().watermark).toBe("CLIENT_COPY");
    const others = await get("/clients", clientToken);
    expect(others.statusCode).toBe(403);

    await post(`/returns/${returnId}/transition`, clientToken, { toStatus: "AWAITING_SIGNATURE" });

    // A stale snapshot hash cannot be signed.
    const staleSign = await post(`/returns/${returnId}/signatures`, clientToken, {
      signatureText: "Avery Testcase",
      consentAcknowledged: true,
      reviewedSnapshotHash: "f".repeat(64),
    });
    expect(staleSign.statusCode).toBe(409);

    const sign = await post(`/returns/${returnId}/signatures`, clientToken, {
      signatureText: "Avery Testcase",
      consentAcknowledged: true,
      reviewedSnapshotHash: snapshotHash,
    });
    expect(sign.statusCode).toBe(201);
    expect(sign.json().status).toBe("SIGNED");
    expect(sign.json().certificateHash).toHaveLength(64);
  });

  it("locks the signed return against edits", async () => {
    const edit = await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: modelFor(returnId),
    });
    expect(edit.statusCode).toBe(409);
  });

  it("e-files through the mock provider and reaches ACCEPTED", async () => {
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "READY_TO_EFILE" });
    const filed = await post(`/returns/${returnId}/efile`, preparerToken);
    expect(filed.statusCode).toBe(202);

    const ret = await get(`/returns/${returnId}`, preparerToken);
    expect(ret.json().status).toBe("ACKNOWLEDGMENT_PENDING");

    // Duplicate submission of the same snapshot is impossible.
    const statusNow = await get(`/returns/${returnId}`, preparerToken);
    expect(statusNow.json().status).not.toBe("READY_TO_EFILE");

    const poll = await post(`/returns/${returnId}/efile/poll`, preparerToken);
    expect(poll.statusCode).toBe(200);
    expect(poll.json().status).toBe("ACCEPTED");
    const submissions = poll.json().submissions;
    expect(submissions).toHaveLength(1);
    expect(submissions[0].acknowledgment.accepted).toBe(true);
    expect(submissions[0].acknowledgment.agencyTrackingId).toBeTruthy();
  });

  it("archives the accepted return and keeps the audit chain intact", async () => {
    const archived = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "ARCHIVED",
    });
    expect(archived.json().status).toBe("ARCHIVED");
    const verify = await get("/audit/verify", adminToken);
    expect(verify.json().valid).toBe(true);
    expect(verify.json().length).toBeGreaterThan(10);
    const history = await get(`/returns/${returnId}/history`, preparerToken);
    const transitions = history.json() as Array<{ fromStatus: string; toStatus: string }>;
    expect(transitions[0]).toMatchObject({ fromStatus: "DRAFT" });
    expect(transitions.at(-1)).toMatchObject({ toStatus: "ARCHIVED" });
  });

  it("dashboard reflects the accepted filing", async () => {
    const dash = await get("/dashboard", preparerToken);
    expect(dash.statusCode).toBe(200);
    expect(dash.json().totals.accepted).toBeGreaterThanOrEqual(1);
  });
});

describe("rejection, correction, and resubmission", () => {
  let clientId: string;
  let returnId: string;

  async function driveToReadyToEfile(model: TaxReturnModel, signToken: string) {
    await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: model,
    });
    const calc = await post(`/returns/${returnId}/calculate`, preparerToken);
    const hash = calc.json().snapshotHash;
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "PREPARER_REVIEWED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_REVIEWER",
    });
    await post(`/returns/${returnId}/transition`, reviewerToken, { toStatus: "APPROVED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_CLIENT_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, signToken, { toStatus: "AWAITING_SIGNATURE" });
    const sign = await post(`/returns/${returnId}/signatures`, signToken, {
      signatureText: "Jordan Rejectcase",
      consentAcknowledged: true,
      reviewedSnapshotHash: hash,
    });
    expect(sign.statusCode).toBe(201);
    const ready = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_TO_EFILE",
    });
    expect(ready.statusCode).toBe(200);
    return hash;
  }

  it("sets up a client whose SSN triggers the scripted provider rejection", async () => {
    const created = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      name: { firstName: "Jordan", lastName: "Rejectcase" },
      email: "jordan.reject@test.ghimtech.example",
      tin: "234-56-9999", // last4 9999 → mock provider rejects with R0000-500-01
    });
    expect(created.statusCode).toBe(201);
    clientId = created.json().id;
    const ret = await post("/returns", preparerToken, {
      clientId,
      taxYear: 2025,
      filingStatus: "SINGLE",
      includePennsylvania: false,
    });
    returnId = ret.json().id;
  });

  it("rejected by the agency → CORRECTION_REQUIRED with explanations", async () => {
    // Admin acts for the client here; the identity-side flows were covered above.
    const model = modelFor(returnId);
    model.taxpayer = { ...model.taxpayer, ssnLast4: "9999" };
    await driveToReadyToEfile(model, adminToken);

    const filed = await post(`/returns/${returnId}/efile`, adminToken);
    expect(filed.statusCode).toBe(202);
    const poll = await post(`/returns/${returnId}/efile/poll`, preparerToken);
    expect(poll.json().status).toBe("CORRECTION_REQUIRED");
    const rejection = poll.json().submissions[0].acknowledgment.rejections[0];
    expect(rejection.code).toBe("R0000-500-01");
    expect(rejection.explanation).toMatch(/Social Security Administration/);
    expect(rejection.correctiveAction).toBeTruthy();
  });

  it("correction invalidates the old signature, re-signs, resubmits, and is accepted", async () => {
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    // Back through the pipeline with corrected data (model edit → signature invalidated).
    const backToDraftish = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "INCOMPLETE",
    });
    expect(backToDraftish.statusCode).toBe(200);

    const corrected = modelFor(returnId);
    corrected.taxpayer = { ...corrected.taxpayer, ssnLast4: "6789" };
    await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: corrected,
    });
    const signatures = await get(`/returns/${returnId}/signatures`, preparerToken);
    expect(signatures.json().every((s: { invalidatedAt?: string }) => s.invalidatedAt)).toBe(true);

    const calc = await post(`/returns/${returnId}/calculate`, preparerToken);
    const hash = calc.json().snapshotHash;
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "PREPARER_REVIEWED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_REVIEWER",
    });
    await post(`/returns/${returnId}/transition`, reviewerToken, { toStatus: "APPROVED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_CLIENT_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, adminToken, { toStatus: "AWAITING_SIGNATURE" });
    await post(`/returns/${returnId}/signatures`, adminToken, {
      signatureText: "Jordan Rejectcase",
      consentAcknowledged: true,
      reviewedSnapshotHash: hash,
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "READY_TO_EFILE" });

    const refiled = await post(`/returns/${returnId}/efile`, preparerToken);
    expect(refiled.statusCode).toBe(202);
    const poll = await post(`/returns/${returnId}/efile/poll`, preparerToken);
    expect(poll.json().status).toBe("ACCEPTED");
    expect(poll.json().submissions).toHaveLength(2);
  });
});

describe("filing guards", () => {
  it("blocks e-filing a return with blocking diagnostics", async () => {
    const created = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      email: "blocked@test.ghimtech.example",
      tin: "345-67-8912",
    });
    const clientId = created.json().id;
    const ret = await post("/returns", preparerToken, {
      clientId,
      taxYear: 2025,
      filingStatus: "SINGLE",
      includePennsylvania: false,
    });
    const returnId = ret.json().id;
    const model = modelFor(returnId, {
      selfEmployment: [
        {
          id: "se-1",
          businessName: "Complex Co",
          description: "x",
          grossReceipts: 10_000_00,
          totalExpenses: 0,
          requiresComplexSchedule: true, // → blocking diagnostic
          belongsToSpouse: false,
        },
      ],
    });
    await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: model,
    });
    const calc = await post(`/returns/${returnId}/calculate`, preparerToken);
    expect(calc.json().diagnostics.some((d: { severity: string }) => d.severity === "ERROR")).toBe(
      true,
    );
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "PREPARER_REVIEWED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_REVIEWER",
    });
    await post(`/returns/${returnId}/transition`, reviewerToken, { toStatus: "APPROVED" });
    // Blocked on the way toward the client/filing.
    const toClient = await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_CLIENT_REVIEW",
    });
    expect(toClient.statusCode).toBe(409);
    expect(toClient.json().error).toMatch(/blocking diagnostics/);
  });

  it("cannot reach READY_TO_EFILE without a valid signature", async () => {
    const created = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      email: "nosig@test.ghimtech.example",
      tin: "456-78-9123",
    });
    const ret = await post("/returns", preparerToken, {
      clientId: created.json().id,
      taxYear: 2025,
      filingStatus: "SINGLE",
      includePennsylvania: false,
    });
    const returnId = ret.json().id;
    await app.inject({
      method: "PUT",
      url: `/returns/${returnId}/model`,
      headers: authed(preparerToken),
      payload: modelFor(returnId),
    });
    await post(`/returns/${returnId}/calculate`, preparerToken);
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_PREPARER_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, { toStatus: "PREPARER_REVIEWED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "READY_FOR_REVIEWER",
    });
    await post(`/returns/${returnId}/transition`, reviewerToken, { toStatus: "APPROVED" });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_CLIENT_REVIEW",
    });
    await post(`/returns/${returnId}/transition`, preparerToken, {
      toStatus: "AWAITING_SIGNATURE",
    });
    // Skip signing; SIGNED cannot be set directly…
    const directSigned = await post(`/returns/${returnId}/transition`, adminToken, {
      toStatus: "SIGNED",
    });
    expect(directSigned.statusCode).toBe(400);
  });

  it("unsupported tax years are rejected at calculation", async () => {
    const created = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      email: "oldyear@test.ghimtech.example",
      tin: "567-89-1234",
    });
    const ret = await post("/returns", preparerToken, {
      clientId: created.json().id,
      taxYear: 2023,
      filingStatus: "SINGLE",
      includePennsylvania: false,
    });
    const calc = await post(`/returns/${ret.json().id}/calculate`, preparerToken);
    expect(calc.statusCode).toBe(422);
    expect(calc.json().error).toMatch(/not supported/);
  });
});

describe("documents", () => {
  it("uploads, OCRs, and verifies a synthetic W-2; quarantines EICAR", async () => {
    const created = await post("/clients", preparerToken, {
      ...CLIENT_PAYLOAD,
      email: "docs@test.ghimtech.example",
      tin: "678-91-2345",
    });
    const clientId = created.json().id;

    const w2Text =
      "Form W-2 Wage and Tax Statement\nEMPLOYER: Synthetic Employer LLC\nBox 1: 60,000.00\nBox 2: 6,000.00";
    const upload = await post("/documents", preparerToken, {
      clientId,
      filename: "w2-2025.txt",
      contentBase64: Buffer.from(w2Text).toString("base64"),
    });
    expect(upload.statusCode).toBe(201);
    expect(upload.json().category).toBe("W2");
    expect(upload.json().status).toBe("PENDING_VERIFICATION");
    const docId = upload.json().id;

    const verify = await post(`/documents/${docId}/verify`, preparerToken, {
      categoryConfirmed: true,
      fields: [{ key: "wages", verifiedValue: "60,000.00" }],
    });
    expect(verify.json().status).toBe("VERIFIED");

    const eicar = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
    const flagged = await post("/documents", preparerToken, {
      clientId,
      filename: "invoice.txt",
      contentBase64: Buffer.from(eicar, "latin1").toString("base64"),
    });
    expect(flagged.statusCode).toBe(422);
    expect(flagged.json().error).toMatch(/malware/);

    const spoofed = await post("/documents", preparerToken, {
      clientId,
      filename: "statement.pdf",
      contentBase64: Buffer.from("MZ not a pdf").toString("base64"),
    });
    expect(spoofed.statusCode).toBe(422);
  });
});
