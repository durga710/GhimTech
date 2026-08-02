/**
 * Provider-neutral e-file contracts.
 *
 * GhimTech Tax never talks to the IRS directly. Filing goes through an
 * authorized e-file provider behind this interface. Provider-specific code
 * lives only inside adapter packages (@ghimtech/efile-providers); nothing in
 * core business logic may reference a concrete provider.
 */
import type { Jurisdiction, TaxReturnModel } from "@ghimtech/tax-domain";

export interface CreateTaxpayerInput {
  /** Opaque platform client id — the provider never receives internal database ids beyond this. */
  externalClientRef: string;
  firstName: string;
  lastName: string;
  /** Encrypted-at-rest values are decrypted only at the transmission boundary. */
  tin: string;
  dateOfBirth: string;
  email?: string;
}

export interface ProviderTaxpayer {
  providerTaxpayerId: string;
}

export interface CreateReturnInput {
  providerTaxpayerId: string;
  taxYear: number;
  jurisdictions: Jurisdiction[];
  /** The normalized return model — adapters map this to the provider's shape. */
  returnModel: TaxReturnModel;
}

export interface UpdateReturnInput {
  returnModel: TaxReturnModel;
}

export interface ProviderReturn {
  providerReturnId: string;
  providerTaxpayerId: string;
  taxYear: number;
}

export interface EFileValidationIssue {
  code: string;
  message: string;
  severity: "ERROR" | "WARNING";
  field?: string;
}

export interface EFileValidationResult {
  valid: boolean;
  issues: EFileValidationIssue[];
}

export interface AuthorizationResult {
  /** Provider-side authorization document reference (e.g. Form 8879 equivalent). */
  authorizationId: string;
  documentUrl?: string;
}

export interface SubmissionAuthorization {
  authorizationId: string;
  /** SHA-256 of the signed return snapshot — must match the signature record. */
  signedSnapshotHash: string;
  signedAt: string;
}

export type SubmissionState = "QUEUED" | "TRANSMITTING" | "TRANSMITTED" | "ACCEPTED" | "REJECTED";

export interface EFileSubmissionReceipt {
  submissionId: string;
  providerReturnId: string;
  state: SubmissionState;
  receivedAt: string;
}

export interface EFileSubmissionStatus {
  submissionId: string;
  state: SubmissionState;
  updatedAt: string;
}

export interface EFileRejection {
  code: string;
  message: string;
  /** Field or form the rejection points at, when the agency provides one. */
  location?: string;
}

export interface EFileAcknowledgment {
  submissionId: string;
  jurisdiction: Jurisdiction;
  accepted: boolean;
  acknowledgedAt: string;
  agencyTrackingId?: string;
  rejections: EFileRejection[];
}

export interface CorrectedReturnInput {
  returnModel: TaxReturnModel;
  /** Codes from the rejection this correction addresses. */
  addressedRejectionCodes: string[];
  authorization: SubmissionAuthorization;
}

/**
 * The provider interface every adapter implements. Mock, sandbox, and real
 * transmitter adapters are interchangeable behind this contract — swapping
 * providers must never require changes to intake, calculation, review,
 * signature, return models, filing UI, or audit logging.
 */
export interface EFileProvider {
  readonly name: string;

  createTaxpayer(input: CreateTaxpayerInput): Promise<ProviderTaxpayer>;

  createReturn(input: CreateReturnInput): Promise<ProviderReturn>;

  updateReturn(providerReturnId: string, input: UpdateReturnInput): Promise<ProviderReturn>;

  validateReturn(providerReturnId: string): Promise<EFileValidationResult>;

  generateAuthorization(providerReturnId: string): Promise<AuthorizationResult>;

  submitReturn(
    providerReturnId: string,
    authorization: SubmissionAuthorization,
  ): Promise<EFileSubmissionReceipt>;

  getSubmissionStatus(submissionId: string): Promise<EFileSubmissionStatus>;

  getAcknowledgment(submissionId: string): Promise<EFileAcknowledgment>;

  resubmitReturn(
    submissionId: string,
    correction: CorrectedReturnInput,
  ): Promise<EFileSubmissionReceipt>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerName: string, detail: string) {
    super(
      `E-file provider "${providerName}" is not configured: ${detail}. ` +
        "Implement the adapter against the provider's official API contract before enabling it.",
    );
    this.name = "ProviderNotConfiguredError";
  }
}

export class DuplicateSubmissionError extends Error {
  constructor(public readonly existingSubmissionId: string) {
    super(`This return snapshot has already been submitted (submission ${existingSubmissionId})`);
    this.name = "DuplicateSubmissionError";
  }
}
