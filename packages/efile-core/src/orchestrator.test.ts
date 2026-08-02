import { describe, expect, it } from "vitest";
import type { Diagnostic } from "@ghimtech/tax-domain";
import {
  DuplicateSubmissionError,
  EFileOrchestrator,
  InMemorySubmissionRegistry,
  SubmissionBlockedError,
  type EFileProvider,
} from "./index.js";
import { explainRejection, knownRejectionCodes } from "./rejection-codes.js";

function stubProvider(): EFileProvider & { submitted: number } {
  const state = { submitted: 0 };
  return {
    name: "stub",
    submitted: 0,
    async createTaxpayer() {
      return { providerTaxpayerId: "tp" };
    },
    async createReturn() {
      return { providerReturnId: "ret", providerTaxpayerId: "tp", taxYear: 2025 };
    },
    async updateReturn() {
      return { providerReturnId: "ret", providerTaxpayerId: "tp", taxYear: 2025 };
    },
    async validateReturn() {
      return { valid: true, issues: [] };
    },
    async generateAuthorization() {
      return { authorizationId: "auth" };
    },
    async submitReturn() {
      state.submitted += 1;
      this.submitted = state.submitted;
      return {
        submissionId: `sub-${state.submitted}`,
        providerReturnId: "ret",
        state: "TRANSMITTED" as const,
        receivedAt: "2026-02-15T00:00:00Z",
      };
    },
    async getSubmissionStatus() {
      return { submissionId: "sub-1", state: "ACCEPTED" as const, updatedAt: "t" };
    },
    async getAcknowledgment() {
      return {
        submissionId: "sub-1",
        jurisdiction: "FEDERAL" as const,
        accepted: true,
        acknowledgedAt: "t",
        rejections: [],
      };
    },
    async resubmitReturn() {
      state.submitted += 1;
      this.submitted = state.submitted;
      return {
        submissionId: `sub-${state.submitted}`,
        providerReturnId: "ret",
        state: "TRANSMITTED" as const,
        receivedAt: "t",
      };
    },
  };
}

const HASH = "c".repeat(64);
const AUTH = { authorizationId: "auth", signedSnapshotHash: HASH, signedAt: "t" };

function blockingDiag(): Diagnostic {
  return {
    code: "UNSUPPORTED_SITUATION",
    severity: "ERROR",
    message: "unsupported",
    jurisdiction: "FEDERAL",
  };
}

describe("EFileOrchestrator", () => {
  it("submits a clean, signed return once", async () => {
    const provider = stubProvider();
    const orch = new EFileOrchestrator(provider, new InMemorySubmissionRegistry());
    const receipt = await orch.submit({
      returnId: "r1",
      providerReturnId: "ret",
      diagnostics: [],
      authorization: AUTH,
      currentSnapshotHash: HASH,
    });
    expect(receipt.submissionId).toBe("sub-1");
  });

  it("blocks submission with blocking diagnostics", async () => {
    const orch = new EFileOrchestrator(stubProvider(), new InMemorySubmissionRegistry());
    await expect(
      orch.submit({
        returnId: "r1",
        providerReturnId: "ret",
        diagnostics: [blockingDiag()],
        authorization: AUTH,
        currentSnapshotHash: HASH,
      }),
    ).rejects.toThrow(SubmissionBlockedError);
  });

  it("blocks submission when the return changed after signing", async () => {
    const orch = new EFileOrchestrator(stubProvider(), new InMemorySubmissionRegistry());
    await expect(
      orch.submit({
        returnId: "r1",
        providerReturnId: "ret",
        diagnostics: [],
        authorization: AUTH,
        currentSnapshotHash: "d".repeat(64),
      }),
    ).rejects.toThrow(/re-sign/);
  });

  it("prevents duplicate submission of the same snapshot", async () => {
    const provider = stubProvider();
    const orch = new EFileOrchestrator(provider, new InMemorySubmissionRegistry());
    const params = {
      returnId: "r1",
      providerReturnId: "ret",
      diagnostics: [],
      authorization: AUTH,
      currentSnapshotHash: HASH,
    };
    await orch.submit(params);
    await expect(orch.submit(params)).rejects.toThrow(DuplicateSubmissionError);
    expect(provider.submitted).toBe(1);
  });

  it("allows resubmission only with a fresh signed snapshot", async () => {
    const provider = stubProvider();
    const orch = new EFileOrchestrator(provider, new InMemorySubmissionRegistry());
    await orch.submit({
      returnId: "r1",
      providerReturnId: "ret",
      diagnostics: [],
      authorization: AUTH,
      currentSnapshotHash: HASH,
    });
    const newHash = "e".repeat(64);
    const receipt = await orch.resubmit("sub-1", {
      returnId: "r1",
      providerReturnId: "ret",
      diagnostics: [],
      authorization: { ...AUTH, signedSnapshotHash: newHash },
      currentSnapshotHash: newHash,
      correction: {
        returnModel: {} as never,
        addressedRejectionCodes: ["IND-031-04"],
        authorization: { ...AUTH, signedSnapshotHash: newHash },
      },
    });
    expect(receipt.submissionId).toBe("sub-2");
  });
});

describe("rejection explanations", () => {
  it("explains known codes with corrective actions", () => {
    const known = explainRejection("R0000-500-01");
    expect(known.explanation).toMatch(/Social Security Administration/);
    expect(known.correctiveAction).toBeTruthy();
    expect(knownRejectionCodes()).toContain("IND-031-04");
  });

  it("never hides unknown codes", () => {
    const unknown = explainRejection("XYZ-999");
    expect(unknown.explanation).toContain("XYZ-999");
    expect(unknown.correctiveAction).toBeTruthy();
  });
});
