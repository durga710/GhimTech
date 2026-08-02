/**
 * SandboxEFileProvider — the mock provider behind simulated network latency
 * and configurable acknowledgment delay. Used in staging so the full queue /
 * polling machinery is exercised the way a real provider integration will be.
 */
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
import { MockEFileProvider, type MockProviderOptions } from "./mock.js";

export interface SandboxOptions extends MockProviderOptions {
  latencyMs?: number;
}

export class SandboxEFileProvider implements EFileProvider {
  readonly name: string = "sandbox";
  private readonly inner: MockEFileProvider;
  private readonly latencyMs: number;

  constructor(options: SandboxOptions = {}) {
    this.inner = new MockEFileProvider({
      ackAfterPolls: options.ackAfterPolls ?? 3,
      now: options.now,
    });
    this.latencyMs = options.latencyMs ?? 150;
  }

  private async delay<T>(fn: () => Promise<T>): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return fn();
  }

  createTaxpayer(input: CreateTaxpayerInput): Promise<ProviderTaxpayer> {
    return this.delay(() => this.inner.createTaxpayer(input));
  }
  createReturn(input: CreateReturnInput): Promise<ProviderReturn> {
    return this.delay(() => this.inner.createReturn(input));
  }
  updateReturn(id: string, input: UpdateReturnInput): Promise<ProviderReturn> {
    return this.delay(() => this.inner.updateReturn(id, input));
  }
  validateReturn(id: string): Promise<EFileValidationResult> {
    return this.delay(() => this.inner.validateReturn(id));
  }
  generateAuthorization(id: string): Promise<AuthorizationResult> {
    return this.delay(() => this.inner.generateAuthorization(id));
  }
  submitReturn(id: string, auth: SubmissionAuthorization): Promise<EFileSubmissionReceipt> {
    return this.delay(() => this.inner.submitReturn(id, auth));
  }
  getSubmissionStatus(id: string): Promise<EFileSubmissionStatus> {
    return this.delay(() => this.inner.getSubmissionStatus(id));
  }
  getAcknowledgment(id: string): Promise<EFileAcknowledgment> {
    return this.delay(() => this.inner.getAcknowledgment(id));
  }
  resubmitReturn(id: string, correction: CorrectedReturnInput): Promise<EFileSubmissionReceipt> {
    return this.delay(() => this.inner.resubmitReturn(id, correction));
  }
}
