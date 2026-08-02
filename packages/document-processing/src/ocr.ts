/**
 * OCR pipeline boundary.
 *
 * The OcrEngine interface isolates whatever OCR backend is configured
 * (self-hosted Tesseract, a document-AI service under a data-processing
 * agreement — never a public AI API with unredacted taxpayer data).
 *
 * Extracted values are *suggestions only*: they enter the return exclusively
 * through the human verification workflow (see verification.ts). Every field
 * carries a confidence score, and low-confidence fields are highlighted for
 * the verifier.
 */
import type { DocumentCategory } from "@ghimtech/tax-domain";

export interface ExtractedField {
  /** Canonical field key, e.g. "wages", "federalWithholding", "employerName". */
  key: string;
  value: string;
  /** 0..1 — verification UI highlights anything under 0.9. */
  confidence: number;
  /** Region on the source page, when the engine provides one. */
  box?: { page: number; x: number; y: number; w: number; h: number };
}

export interface OcrResult {
  category: DocumentCategory;
  categoryConfidence: number;
  fields: ExtractedField[];
  rawText: string;
}

export interface OcrEngine {
  readonly name: string;
  process(content: Uint8Array, filename: string): Promise<OcrResult>;
}

/** Keyword-driven document classification, used as a pre-OCR hint and fallback. */
export function classifyByText(text: string): { category: DocumentCategory; confidence: number } {
  const t = text.toUpperCase();
  const rules: Array<[DocumentCategory, string[]]> = [
    ["W2", ["W-2", "WAGE AND TAX STATEMENT"]],
    ["FORM_1099_INT", ["1099-INT", "INTEREST INCOME"]],
    ["FORM_1099_DIV", ["1099-DIV", "DIVIDENDS AND DISTRIBUTIONS"]],
    ["FORM_1099_NEC", ["1099-NEC", "NONEMPLOYEE COMPENSATION"]],
    ["FORM_1099_MISC", ["1099-MISC", "MISCELLANEOUS INFORMATION"]],
    ["FORM_1099_R", ["1099-R", "DISTRIBUTIONS FROM PENSIONS"]],
    ["SSA_1099", ["SSA-1099", "SOCIAL SECURITY BENEFIT STATEMENT"]],
    ["FORM_1098", ["FORM 1098", "MORTGAGE INTEREST STATEMENT"]],
    ["FORM_1098_T", ["1098-T", "TUITION STATEMENT"]],
    ["FORM_1095_A", ["1095-A", "HEALTH INSURANCE MARKETPLACE STATEMENT"]],
    ["PA_TAX_DOCUMENT", ["PA-40", "PENNSYLVANIA"]],
    ["DRIVER_LICENSE", ["DRIVER LICENSE", "DRIVER'S LICENSE", "DLN"]],
    ["SOCIAL_SECURITY_CARD", ["SOCIAL SECURITY CARD"]],
  ];
  for (const [category, keywords] of rules) {
    const hits = keywords.filter((k) => t.includes(k)).length;
    if (hits > 0) {
      return { category, confidence: Math.min(0.5 + hits * 0.25, 0.95) };
    }
  }
  return { category: "OTHER", confidence: 0.2 };
}

/**
 * Deterministic mock OCR engine for development and tests: parses labeled
 * text documents of the form "Box 1: 60000.00". Real deployments configure a
 * proper engine behind the same interface.
 */
export class MockOcrEngine implements OcrEngine {
  readonly name = "mock-ocr";

  async process(content: Uint8Array, _filename: string): Promise<OcrResult> {
    const text = Buffer.from(content).toString("utf8");
    const { category, confidence } = classifyByText(text);
    const fields: ExtractedField[] = [];

    const patterns: Array<[string, RegExp]> = [
      ["employerName", /EMPLOYER:\s*(.+)/i],
      ["payerName", /PAYER:\s*(.+)/i],
      ["wages", /BOX\s*1:?\s*\$?([\d,]+\.?\d*)/i],
      ["federalWithholding", /BOX\s*2:?\s*\$?([\d,]+\.?\d*)/i],
      ["socialSecurityWages", /BOX\s*3:?\s*\$?([\d,]+\.?\d*)/i],
      ["medicareWages", /BOX\s*5:?\s*\$?([\d,]+\.?\d*)/i],
      ["stateWages", /BOX\s*16:?\s*\$?([\d,]+\.?\d*)/i],
      ["stateWithholding", /BOX\s*17:?\s*\$?([\d,]+\.?\d*)/i],
    ];
    for (const [key, pattern] of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        fields.push({ key, value: match[1].trim(), confidence: 0.92 });
      }
    }
    return { category, categoryConfidence: confidence, fields, rawText: text };
  }
}
