/**
 * MockEFileProvider — a deterministic, in-memory provider used for local
 * development and the automated test suite. It simulates the full submission
 * lifecycle, including acknowledgment latency and scripted rejections.
 *
 * Scenario control (deterministic, no randomness):
 *   - taxpayer ssnLast4 "9999"  → rejected with R0000-500-01 (name/SSN mismatch)
 *   - taxpayer ssnLast4 "9998"  → rejected with IND-031-04 (prior-year AGI mismatch)
 *   - dependent ssnLast4 "9997" → rejected with SEIC-F1040-501-02 (EITC child mismatch)
 *   - anything else             → accepted
 *
 * Acknowledgments become available after `ackAfterPolls` status polls,
 * simulating agency latency.
 */
import { randomUUID } from "node:crypto";
import type {
  AuthorizationResult,
  CorrectedReturnInput,
  CreateReturnInput,
  CreateTaxpayerInput,
  EFileAcknowledgment,
  EFileProvider,
  EFileSubmissionReceipt,
  EFileSubmissionStatus,
  EFileValidationResult,
  ProviderReturn,
  ProviderTaxpayer,
  SubmissionAuthorization,
  UpdateReturnInput,
} from "@ghimtech/efile-core";
import type { TaxReturnModel } from "@ghimtech/tax-domain";

interface StoredReturn {
  providerReturnId: string;
  providerTaxpayerId: string;
  taxYear: number;
  model: TaxReturnModel;
}

interface StoredSubmission {
  submissionId: string;
  providerReturnId: string;
  submittedAt: string;
  polls: number;
  resolved: boolean;
  accepted: boolean;
  rejectionCodes: string[];
  jurisdiction: "FEDERAL" | "PENNSYLVANIA";
}

export interface MockProviderOptions {
  /** Number of status polls before the acknowledgment resolves. */
  ackAfterPolls?: number;
  /** Fixed clock for deterministic timestamps in tests. */
  now?: () => string;
}

export class MockEFileProvider implements EFileProvider {
  readonly name: string = "mock";
  private readonly taxpayers = new Map<string, CreateTaxpayerInput>();
  private readonly returns = new Map<string, StoredReturn>();
  private readonly submissions = new Map<string, StoredSubmission>();
  private readonly ackAfterPolls: number;
  private readonly now: () => string;
  private counter = 0;

  constructor(options: MockProviderOptions = {}) {
    this.ackAfterPolls = options.ackAfterPolls ?? 1;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  private nextId(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${this.counter.toString(36)}_${randomUUID().slice(0, 8)}`;
  }

  async createTaxpayer(input: CreateTaxpayerInput): Promise<ProviderTaxpayer> {
    const providerTaxpayerId = this.nextId("mock_tp");
    this.taxpayers.set(providerTaxpayerId, input);
    return { providerTaxpayerId };
  }

  async createReturn(input: CreateReturnInput): Promise<ProviderReturn> {
    if (!this.taxpayers.has(input.providerTaxpayerId)) {
      throw new Error(`Unknown provider taxpayer ${input.providerTaxpayerId}`);
    }
    const providerReturnId = this.nextId("mock_ret");
    this.returns.set(providerReturnId, {
      providerReturnId,
      providerTaxpayerId: input.providerTaxpayerId,
      taxYear: input.taxYear,
      model: input.returnModel,
    });
    return {
      providerReturnId,
      providerTaxpayerId: input.providerTaxpayerId,
      taxYear: input.taxYear,
    };
  }

  async updateReturn(providerReturnId: string, input: UpdateReturnInput): Promise<ProviderReturn> {
    const stored = this.returns.get(providerReturnId);
    if (!stored) throw new Error(`Unknown provider return ${providerReturnId}`);
    stored.model = input.returnModel;
    return {
      providerReturnId,
      providerTaxpayerId: stored.providerTaxpayerId,
      taxYear: stored.taxYear,
    };
  }

  async validateReturn(providerReturnId: string): Promise<EFileValidationResult> {
    const stored = this.returns.get(providerReturnId);
    if (!stored) throw new Error(`Unknown provider return ${providerReturnId}`);
    const issues: EFileValidationResult["issues"] = [];
    if (!stored.model.taxpayer.ssnRef) {
      issues.push({
        code: "MOCK-VAL-001",
        message: "Taxpayer TIN missing",
        severity: "ERROR",
      });
    }
    if (stored.model.w2s.length === 0 && stored.model.selfEmployment.length === 0) {
      issues.push({
        code: "MOCK-VAL-002",
        message: "Return has no income documents",
        severity: "WARNING",
      });
    }
    return { valid: !issues.some((i) => i.severity === "ERROR"), issues };
  }

  async generateAuthorization(providerReturnId: string): Promise<AuthorizationResult> {
    if (!this.returns.has(providerReturnId)) {
      throw new Error(`Unknown provider return ${providerReturnId}`);
    }
    return { authorizationId: this.nextId("mock_auth") };
  }

  private scriptedOutcome(model: TaxReturnModel): { accepted: boolean; codes: string[] } {
    if (model.taxpayer.ssnLast4 === "9999") return { accepted: false, codes: ["R0000-500-01"] };
    if (model.taxpayer.ssnLast4 === "9998") return { accepted: false, codes: ["IND-031-04"] };
    if (model.dependents.some((d) => d.ssnLast4 === "9997")) {
      return { accepted: false, codes: ["SEIC-F1040-501-02"] };
    }
    return { accepted: true, codes: [] };
  }

  async submitReturn(
    providerReturnId: string,
    _authorization: SubmissionAuthorization,
  ): Promise<EFileSubmissionReceipt> {
    const stored = this.returns.get(providerReturnId);
    if (!stored) throw new Error(`Unknown provider return ${providerReturnId}`);
    const outcome = this.scriptedOutcome(stored.model);
    const submissionId = this.nextId("mock_sub");
    this.submissions.set(submissionId, {
      submissionId,
      providerReturnId,
      submittedAt: this.now(),
      polls: 0,
      resolved: false,
      accepted: outcome.accepted,
      rejectionCodes: outcome.codes,
      jurisdiction: "FEDERAL",
    });
    return {
      submissionId,
      providerReturnId,
      state: "TRANSMITTED",
      receivedAt: this.now(),
    };
  }

  async getSubmissionStatus(submissionId: string): Promise<EFileSubmissionStatus> {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error(`Unknown submission ${submissionId}`);
    if (!sub.resolved) {
      sub.polls += 1;
      if (sub.polls >= this.ackAfterPolls) sub.resolved = true;
    }
    return {
      submissionId,
      state: sub.resolved ? (sub.accepted ? "ACCEPTED" : "REJECTED") : "TRANSMITTED",
      updatedAt: this.now(),
    };
  }

  async getAcknowledgment(submissionId: string): Promise<EFileAcknowledgment> {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error(`Unknown submission ${submissionId}`);
    if (!sub.resolved) throw new Error(`Submission ${submissionId} has no acknowledgment yet`);
    return {
      submissionId,
      jurisdiction: sub.jurisdiction,
      accepted: sub.accepted,
      acknowledgedAt: this.now(),
      agencyTrackingId: `MOCK${submissionId.slice(-8).toUpperCase()}`,
      rejections: sub.rejectionCodes.map((code) => ({
        code,
        message: `Mock rejection ${code}`,
      })),
    };
  }

  async resubmitReturn(
    submissionId: string,
    correction: CorrectedReturnInput,
  ): Promise<EFileSubmissionReceipt> {
    const original = this.submissions.get(submissionId);
    if (!original) throw new Error(`Unknown submission ${submissionId}`);
    if (original.accepted) throw new Error("Cannot resubmit an accepted submission");
    const stored = this.returns.get(original.providerReturnId);
    if (!stored) throw new Error("Original return missing");
    stored.model = correction.returnModel;
    return this.submitReturn(original.providerReturnId, correction.authorization);
  }
}
