/**
 * Form documents: structured, printable representations of a calculated
 * return. Rendering to paper/PDF happens via print-optimized HTML in the web
 * app; e-file transmission uses the normalized model through the provider
 * adapter, never these documents. IRS-facsimile PDF rendering onto official
 * form templates is a planned follow-up (see docs/adr/0005-forms-rendering.md).
 */

export type Watermark = "DRAFT" | "CLIENT_COPY" | "FILING_COPY" | "REVIEW_COPY";

export interface FormLine {
  /** Line number as printed on the form, e.g. "11" or "1a". */
  line: string;
  label: string;
  /** Whole-dollar value; undefined renders as blank. */
  value?: number;
  /** Non-numeric entry, e.g. filing status or masked identifiers. */
  text?: string;
  /** Marks a value derived from a calculation trace entry. */
  traceLineId?: string;
}

export interface FormSection {
  title: string;
  lines: FormLine[];
}

export interface FormDocument {
  formId: string; // e.g. "1040", "PA-40", "GHIMTECH-AUTH"
  title: string;
  taxYear: number;
  ruleVersion: string;
  watermark: Watermark;
  /** Masked taxpayer identity block. */
  taxpayerName: string;
  taxpayerTinMasked: string;
  spouseName?: string;
  spouseTinMasked?: string;
  sections: FormSection[];
}

export interface ReturnPackage {
  /** SHA-256 over the canonical snapshot (model + results) this package renders. */
  snapshotHash: string;
  watermark: Watermark;
  documents: FormDocument[];
}
