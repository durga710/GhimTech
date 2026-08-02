/**
 * Human verification workflow for OCR output.
 *
 * OCR-extracted values NEVER enter the return model directly. A preparer (or
 * the client, with preparer confirmation) reviews each extracted field,
 * corrects it as needed, and confirms. Only confirmed values are applied, and
 * the applied set records who verified what and when.
 */
import type { ExtractedField, OcrResult } from "./ocr.js";

export interface FieldVerification {
  key: string;
  extractedValue: string;
  /** The value the human confirmed (possibly corrected). */
  verifiedValue: string;
  corrected: boolean;
}

export interface DocumentVerification {
  documentId: string;
  verifiedBy: string;
  verifiedAt: string;
  categoryConfirmed: boolean;
  fields: FieldVerification[];
}

export class UnverifiedFieldError extends Error {
  constructor(public readonly missingKeys: string[]) {
    super(`OCR fields not yet verified: ${missingKeys.join(", ")}`);
    this.name = "UnverifiedFieldError";
  }
}

/**
 * Build the verification worksheet a human completes. Every extracted field
 * must be explicitly confirmed or corrected.
 */
export function buildVerificationWorksheet(ocr: OcrResult): Array<{
  key: string;
  suggestedValue: string;
  needsAttention: boolean;
}> {
  return ocr.fields.map((field: ExtractedField) => ({
    key: field.key,
    suggestedValue: field.value,
    needsAttention: field.confidence < 0.9,
  }));
}

/**
 * Validate a completed verification against the OCR result and return the
 * verified values keyed by field. Throws when any extracted field was left
 * unverified — partial verification cannot be applied to a return.
 */
export function applyVerification(
  ocr: OcrResult,
  verification: DocumentVerification,
): Record<string, string> {
  const verifiedKeys = new Set(verification.fields.map((f) => f.key));
  const missing = ocr.fields.map((f) => f.key).filter((k) => !verifiedKeys.has(k));
  if (missing.length > 0) throw new UnverifiedFieldError(missing);
  const result: Record<string, string> = {};
  for (const field of verification.fields) {
    result[field.key] = field.verifiedValue;
  }
  return result;
}

/** Parse a verified currency string to integer cents (deterministic). */
export function verifiedValueToCents(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error(`Not a valid currency amount: ${value}`);
  }
  const [dollars, cents = "0"] = cleaned.split(".");
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
}
