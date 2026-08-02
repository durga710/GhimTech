/**
 * Zod schemas shared by the API (request validation) and the web app (form
 * validation). Sensitive raw values (full SSN, full account number) appear
 * only in dedicated capture schemas used by encrypted-intake endpoints.
 */
import { z } from "zod";
import {
  BANK_ACCOUNT_TYPES,
  DEPENDENT_RELATIONSHIPS,
  DOCUMENT_CATEGORIES,
  FILING_STATUSES,
  PA_RESIDENCY_STATUSES,
  RETURN_STATUSES,
  ROLES,
} from "@ghimtech/tax-domain";
import { isValidPsdCode, isValidRoutingNumber, isValidTin, isValidZip } from "./identifiers.js";

export const centsSchema = z.number().int().safe().nonnegative();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const personNameSchema = z.object({
  firstName: z.string().min(1).max(100),
  middleInitial: z.string().max(1).optional(),
  lastName: z.string().min(1).max(100),
  suffix: z.string().max(10).optional(),
});

export const addressSchema = z.object({
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip: z.string().refine(isValidZip, "Invalid ZIP code"),
});

/** Raw TIN capture — used only by the encrypted identity endpoint. */
export const tinCaptureSchema = z
  .string()
  .transform((v) => v.replace(/-/g, ""))
  .refine(isValidTin, "Invalid SSN/ITIN");

export const bankAccountCaptureSchema = z.object({
  routingNumber: z.string().refine(isValidRoutingNumber, "Invalid routing number"),
  accountNumber: z.string().regex(/^\d{4,17}$/, "Invalid account number"),
  accountType: z.enum(BANK_ACCOUNT_TYPES),
  bankName: z.string().max(120).optional(),
});

export const roleSchema = z.enum(ROLES);
export const filingStatusSchema = z.enum(FILING_STATUSES);
export const returnStatusSchema = z.enum(RETURN_STATUSES);
export const paResidencySchema = z.enum(PA_RESIDENCY_STATUSES);
export const documentCategorySchema = z.enum(DOCUMENT_CATEGORIES);
export const relationshipSchema = z.enum(DEPENDENT_RELATIONSHIPS);

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(1024),
});

export const mfaVerifySchema = z.object({
  mfaToken: z.string().min(16),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const createUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(200),
  role: roleSchema,
  temporaryPassword: z.string().min(12).max(1024),
});

export const createClientSchema = z.object({
  name: personNameSchema,
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  address: addressSchema,
  dateOfBirth: isoDateSchema,
  tin: tinCaptureSchema,
  assignedPreparerId: z.string().uuid().optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const createReturnSchema = z.object({
  clientId: z.string().uuid(),
  taxYear: z.number().int().min(2020).max(2035),
  filingStatus: filingStatusSchema,
  includePennsylvania: z.boolean().default(true),
});

export const w2InputSchema = z.object({
  employerName: z.string().min(1).max(200),
  employerEin: z.string().max(12).optional(),
  wages: centsSchema,
  federalWithholding: centsSchema,
  socialSecurityWages: centsSchema,
  medicareWages: centsSchema,
  stateWages: centsSchema.default(0),
  stateWithholding: centsSchema.default(0),
  stateCode: z.string().length(2).optional(),
  localWithholding: centsSchema.default(0),
  belongsToSpouse: z.boolean().default(false),
});

export const dependentInputSchema = z.object({
  name: personNameSchema,
  tin: tinCaptureSchema,
  dateOfBirth: isoDateSchema,
  relationship: relationshipSchema,
  monthsLivedWithTaxpayer: z.number().int().min(0).max(12),
  isStudent: z.boolean().default(false),
  isPermanentlyDisabled: z.boolean().default(false),
  providedOwnSupport: z.boolean().default(false),
  qualifiesAsQualifyingChild: z.boolean().default(false),
  eligibleForChildTaxCredit: z.boolean().default(false),
  eligibleForOtherDependentCredit: z.boolean().default(false),
  eitcQualifyingChild: z.boolean().default(false),
  qualifiesForDependentCare: z.boolean().default(false),
});

export const pennsylvaniaInfoSchema = z.object({
  residencyStatus: paResidencySchema,
  residencyStartDate: isoDateSchema.optional(),
  residencyEndDate: isoDateSchema.optional(),
  schoolDistrict: z.string().max(120).optional(),
  psdCode: z.string().refine(isValidPsdCode, "PSD code must be 6 digits").optional(),
  localEitRate: z.number().min(0).max(0.05).optional(),
  claimTaxForgiveness: z.boolean().default(false),
  spEligibilityOtherIncome: centsSchema.default(0),
});

export const statusTransitionSchema = z.object({
  toStatus: returnStatusSchema,
  note: z.string().max(2000).optional(),
});

export const signatureCaptureSchema = z.object({
  /** Client attests identity and intent; the signature image is a drawn SVG path or typed name. */
  signatureText: z.string().min(2).max(200),
  consentAcknowledged: z.literal(true),
  /** SHA-256 of the return snapshot the client reviewed — must match server-side. */
  reviewedSnapshotHash: z.string().length(64),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type W2Input = z.infer<typeof w2InputSchema>;
export type DependentInput = z.infer<typeof dependentInputSchema>;
