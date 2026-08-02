/**
 * Contract tests: every working provider adapter must pass this exact suite.
 * When a real transmitter adapter (Column Tax, april, or another authorized
 * provider) is implemented, add it to the matrix below — the suite is the
 * acceptance bar for swapping providers without touching business logic.
 */
import { describe, expect, it } from "vitest";
import type { EFileProvider } from "@ghimtech/efile-core";
import { ProviderNotConfiguredError } from "@ghimtech/efile-core";
import { singleW2Return } from "@ghimtech/testing";
import { MockEFileProvider } from "./mock.js";
import { SandboxEFileProvider } from "./sandbox.js";
import { createAprilProvider, createColumnTaxProvider } from "./placeholders.js";
import { createProvider } from "./registry.js";

const FIXED_NOW = () => "2026-02-15T12:00:00.000Z";

const matrix: Array<{ label: string; make: () => EFileProvider; polls: number }> = [
  {
    label: "MockEFileProvider",
    make: () => new MockEFileProvider({ ackAfterPolls: 1, now: FIXED_NOW }),
    polls: 1,
  },
  {
    label: "SandboxEFileProvider",
    make: () => new SandboxEFileProvider({ ackAfterPolls: 2, latencyMs: 1, now: FIXED_NOW }),
    polls: 2,
  },
];

const AUTH = {
  authorizationId: "auth-1",
  signedSnapshotHash: "a".repeat(64),
  signedAt: FIXED_NOW(),
};

for (const { label, make, polls } of matrix) {
  describe(`provider contract — ${label}`, () => {
    async function setup(provider: EFileProvider, model = singleW2Return()) {
      const taxpayer = await provider.createTaxpayer({
        externalClientRef: "client-1",
        firstName: "Avery",
        lastName: "Testcase",
        tin: "123456789",
        dateOfBirth: "1985-06-15",
      });
      const ret = await provider.createReturn({
        providerTaxpayerId: taxpayer.providerTaxpayerId,
        taxYear: 2025,
        jurisdictions: ["FEDERAL", "PENNSYLVANIA"],
        returnModel: model,
      });
      return { taxpayer, ret };
    }

    it("creates taxpayer and return, validates, authorizes", async () => {
      const provider = make();
      const { ret } = await setup(provider);
      const validation = await provider.validateReturn(ret.providerReturnId);
      expect(validation.valid).toBe(true);
      const auth = await provider.generateAuthorization(ret.providerReturnId);
      expect(auth.authorizationId).toBeTruthy();
    });

    it("submits and reaches ACCEPTED for a clean return", async () => {
      const provider = make();
      const { ret } = await setup(provider);
      const receipt = await provider.submitReturn(ret.providerReturnId, AUTH);
      expect(receipt.state).toBe("TRANSMITTED");

      let state = "TRANSMITTED";
      for (let i = 0; i < polls + 1 && state === "TRANSMITTED"; i++) {
        state = (await provider.getSubmissionStatus(receipt.submissionId)).state;
      }
      expect(state).toBe("ACCEPTED");
      const ack = await provider.getAcknowledgment(receipt.submissionId);
      expect(ack.accepted).toBe(true);
      expect(ack.agencyTrackingId).toBeTruthy();
      expect(ack.rejections).toEqual([]);
    });

    it("rejects the scripted bad-SSN scenario, then accepts the corrected resubmission", async () => {
      const provider = make();
      const badModel = singleW2Return();
      badModel.taxpayer = { ...badModel.taxpayer, ssnLast4: "9999" };
      const { ret } = await setup(provider, badModel);

      const receipt = await provider.submitReturn(ret.providerReturnId, AUTH);
      let state = "TRANSMITTED";
      for (let i = 0; i < polls + 1 && state === "TRANSMITTED"; i++) {
        state = (await provider.getSubmissionStatus(receipt.submissionId)).state;
      }
      expect(state).toBe("REJECTED");
      const ack = await provider.getAcknowledgment(receipt.submissionId);
      expect(ack.accepted).toBe(false);
      expect(ack.rejections.map((r) => r.code)).toContain("R0000-500-01");

      // Correct and resubmit
      const corrected = singleW2Return();
      const resubmit = await provider.resubmitReturn(receipt.submissionId, {
        returnModel: corrected,
        addressedRejectionCodes: ["R0000-500-01"],
        authorization: { ...AUTH, signedSnapshotHash: "b".repeat(64) },
      });
      let state2 = "TRANSMITTED";
      for (let i = 0; i < polls + 1 && state2 === "TRANSMITTED"; i++) {
        state2 = (await provider.getSubmissionStatus(resubmit.submissionId)).state;
      }
      expect(state2).toBe("ACCEPTED");
    });

    it("updateReturn replaces the stored model", async () => {
      const provider = make();
      const { ret } = await setup(provider);
      const updated = await provider.updateReturn(ret.providerReturnId, {
        returnModel: singleW2Return({ taxYear: 2025 }),
      });
      expect(updated.providerReturnId).toBe(ret.providerReturnId);
    });

    it("acknowledgment polling is idempotent after resolution", async () => {
      const provider = make();
      const { ret } = await setup(provider);
      const receipt = await provider.submitReturn(ret.providerReturnId, AUTH);
      for (let i = 0; i < polls + 3; i++) {
        await provider.getSubmissionStatus(receipt.submissionId);
      }
      const ack1 = await provider.getAcknowledgment(receipt.submissionId);
      const ack2 = await provider.getAcknowledgment(receipt.submissionId);
      expect(ack1.accepted).toBe(ack2.accepted);
      expect(ack1.agencyTrackingId).toBe(ack2.agencyTrackingId);
    });
  });
}

describe("placeholder adapters", () => {
  it("throw ProviderNotConfiguredError instead of pretending to work", async () => {
    for (const provider of [createColumnTaxProvider(), createAprilProvider()]) {
      await expect(
        provider.createTaxpayer({
          externalClientRef: "x",
          firstName: "A",
          lastName: "B",
          tin: "123456789",
          dateOfBirth: "1990-01-01",
        }),
      ).rejects.toThrow(ProviderNotConfiguredError);
    }
  });
});

describe("provider registry", () => {
  it("resolves configured providers and rejects unknown names", () => {
    expect(createProvider("mock").name).toBe("mock");
    expect(createProvider("sandbox").name).toBe("sandbox");
    expect(createProvider("column-tax").name).toBe("column-tax");
    expect(() => createProvider("nonsense")).toThrow(/Unknown e-file provider/);
  });
});
