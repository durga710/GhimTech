import { describe, expect, it } from "vitest";
import { classifyByText, MockOcrEngine } from "./ocr.js";
import { EicarTestScanner, validateUpload, MAX_UPLOAD_BYTES } from "./upload.js";
import {
  applyVerification,
  buildVerificationWorksheet,
  UnverifiedFieldError,
  verifiedValueToCents,
} from "./verification.js";

describe("upload validation", () => {
  const pdfHead = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  it("accepts a real PDF", () => {
    const result = validateUpload({ filename: "w2.pdf", sizeBytes: 50_000, head: pdfHead });
    expect(result.ok).toBe(true);
    expect(result.detectedMime).toBe("application/pdf");
  });

  it("rejects spoofed extensions (exe bytes named .pdf)", () => {
    const exeHead = new Uint8Array([0x4d, 0x5a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = validateUpload({ filename: "w2.pdf", sizeBytes: 50_000, head: exeHead });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/spoofed/);
  });

  it("rejects disallowed types, oversize, and empty files", () => {
    expect(validateUpload({ filename: "malware.exe", sizeBytes: 100, head: pdfHead }).ok).toBe(
      false,
    );
    expect(
      validateUpload({ filename: "big.pdf", sizeBytes: MAX_UPLOAD_BYTES + 1, head: pdfHead }).ok,
    ).toBe(false);
    expect(validateUpload({ filename: "empty.pdf", sizeBytes: 0, head: pdfHead }).ok).toBe(false);
  });

  it("flags the EICAR test file through the scanner boundary", async () => {
    const scanner = new EicarTestScanner();
    const eicar = Buffer.from(
      "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
      "latin1",
    );
    expect((await scanner.scan(eicar)).clean).toBe(false);
    expect((await scanner.scan(Buffer.from("hello"))).clean).toBe(true);
  });
});

describe("classification and OCR", () => {
  it("classifies common documents from text", () => {
    expect(classifyByText("Form W-2 Wage and Tax Statement 2025").category).toBe("W2");
    expect(classifyByText("Form 1099-INT Interest Income").category).toBe("FORM_1099_INT");
    expect(classifyByText("SSA-1099 Social Security Benefit Statement").category).toBe("SSA_1099");
    expect(classifyByText("random grocery receipt").category).toBe("OTHER");
  });

  it("extracts labeled W-2 fields deterministically", async () => {
    const engine = new MockOcrEngine();
    const doc = Buffer.from(
      "Form W-2 Wage and Tax Statement\nEMPLOYER: Synthetic Employer LLC\nBox 1: 60,000.00\nBox 2: 6,000.00\nBox 16: 60,000.00\nBox 17: 1,842.00",
    );
    const result = await engine.process(doc, "w2.txt");
    expect(result.category).toBe("W2");
    expect(result.fields.find((f) => f.key === "wages")?.value).toBe("60,000.00");
    expect(result.fields.find((f) => f.key === "employerName")?.value).toBe(
      "Synthetic Employer LLC",
    );
  });
});

describe("human verification workflow", () => {
  const engine = new MockOcrEngine();
  const doc = Buffer.from("W-2 Wage and Tax Statement\nBox 1: 60,000.00\nBox 2: 6,000.00");

  it("requires every extracted field to be verified", async () => {
    const ocr = await engine.process(doc, "w2.txt");
    const worksheet = buildVerificationWorksheet(ocr);
    expect(worksheet.length).toBeGreaterThan(0);
    expect(() =>
      applyVerification(ocr, {
        documentId: "doc-1",
        verifiedBy: "user-1",
        verifiedAt: "2026-02-01T00:00:00Z",
        categoryConfirmed: true,
        fields: [], // nothing verified
      }),
    ).toThrow(UnverifiedFieldError);
  });

  it("applies corrected values from the verifier", async () => {
    const ocr = await engine.process(doc, "w2.txt");
    const applied = applyVerification(ocr, {
      documentId: "doc-1",
      verifiedBy: "user-1",
      verifiedAt: "2026-02-01T00:00:00Z",
      categoryConfirmed: true,
      fields: ocr.fields.map((f) => ({
        key: f.key,
        extractedValue: f.value,
        verifiedValue: f.key === "wages" ? "61,000.00" : f.value,
        corrected: f.key === "wages",
      })),
    });
    expect(applied["wages"]).toBe("61,000.00");
    expect(verifiedValueToCents(applied["wages"]!)).toBe(6_100_000);
  });

  it("parses verified currency strictly", () => {
    expect(verifiedValueToCents("$1,234.5")).toBe(123_450);
    expect(verifiedValueToCents("1234")).toBe(123_400);
    expect(() => verifiedValueToCents("12.345")).toThrow();
    expect(() => verifiedValueToCents("abc")).toThrow();
  });
});
