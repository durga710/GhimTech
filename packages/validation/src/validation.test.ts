import { describe, expect, it } from "vitest";
import {
  isValidItin,
  isValidPsdCode,
  isValidRoutingNumber,
  isValidSsn,
  isValidZip,
} from "./identifiers.js";
import {
  bankAccountCaptureSchema,
  createClientSchema,
  loginSchema,
  signatureCaptureSchema,
  tinCaptureSchema,
} from "./schemas.js";

describe("SSN/ITIN validation", () => {
  it("accepts structurally valid SSNs", () => {
    expect(isValidSsn("123-45-6789")).toBe(true);
    expect(isValidSsn("123456789")).toBe(true);
  });
  it("rejects invalid areas, groups, and serials", () => {
    expect(isValidSsn("000-45-6789")).toBe(false);
    expect(isValidSsn("666-45-6789")).toBe(false);
    expect(isValidSsn("900-45-6789")).toBe(false); // ITIN range, not SSN
    expect(isValidSsn("123-00-6789")).toBe(false);
    expect(isValidSsn("123-45-0000")).toBe(false);
    expect(isValidSsn("12345678")).toBe(false);
  });
  it("recognizes ITIN ranges", () => {
    expect(isValidItin("912-70-1234")).toBe(true);
    expect(isValidItin("123-70-1234")).toBe(false);
  });
});

describe("routing number checksum", () => {
  it("accepts valid routing numbers", () => {
    // Well-known test routing numbers with valid checksums.
    expect(isValidRoutingNumber("011000015")).toBe(true); // Federal Reserve Boston
    expect(isValidRoutingNumber("031000053")).toBe(true); // Philadelphia
  });
  it("rejects checksum failures and bad prefixes", () => {
    expect(isValidRoutingNumber("011000016")).toBe(false);
    expect(isValidRoutingNumber("991000015")).toBe(false);
    expect(isValidRoutingNumber("12345")).toBe(false);
  });
});

describe("misc identifiers", () => {
  it("validates ZIPs and PSD codes", () => {
    expect(isValidZip("17101")).toBe(true);
    expect(isValidZip("17101-1234")).toBe(true);
    expect(isValidZip("1710")).toBe(false);
    expect(isValidPsdCode("220402")).toBe(true);
    expect(isValidPsdCode("2204")).toBe(false);
  });
});

describe("schemas", () => {
  it("normalizes TIN capture by stripping dashes", () => {
    expect(tinCaptureSchema.parse("123-45-6789")).toBe("123456789");
    expect(() => tinCaptureSchema.parse("000-00-0000")).toThrow();
  });

  it("validates bank capture", () => {
    expect(
      bankAccountCaptureSchema.parse({
        routingNumber: "031000053",
        accountNumber: "12345678",
        accountType: "CHECKING",
      }).accountType,
    ).toBe("CHECKING");
    expect(() =>
      bankAccountCaptureSchema.parse({
        routingNumber: "031000054",
        accountNumber: "12345678",
        accountType: "CHECKING",
      }),
    ).toThrow();
  });

  it("validates client creation", () => {
    const parsed = createClientSchema.parse({
      name: { firstName: "Avery", lastName: "Testcase" },
      email: "avery@example.com",
      address: { line1: "100 Synthetic St", city: "Harrisburg", state: "PA", zip: "17101" },
      dateOfBirth: "1985-06-15",
      tin: "123-45-6789",
    });
    expect(parsed.tin).toBe("123456789");
    expect(parsed.tags).toEqual([]);
  });

  it("requires signature consent to be literally true", () => {
    expect(() =>
      signatureCaptureSchema.parse({
        signatureText: "Avery Testcase",
        consentAcknowledged: false,
        reviewedSnapshotHash: "a".repeat(64),
      }),
    ).toThrow();
  });

  it("rejects malformed logins", () => {
    expect(() => loginSchema.parse({ email: "not-an-email", password: "x" })).toThrow();
  });
});
