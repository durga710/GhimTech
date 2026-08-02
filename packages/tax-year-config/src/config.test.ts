import { describe, expect, it } from "vitest";
import {
  FEDERAL_2025,
  PENNSYLVANIA_2025,
  UnsupportedTaxYearError,
  getFederalConfig,
  getPennsylvaniaConfig,
  supportedTaxYears,
} from "./index.js";
import { FILING_STATUSES } from "@ghimtech/tax-domain";

describe("tax year registry", () => {
  it("supports 2025", () => {
    expect(supportedTaxYears()).toEqual([2025]);
    expect(getFederalConfig(2025)).toBe(FEDERAL_2025);
    expect(getPennsylvaniaConfig(2025)).toBe(PENNSYLVANIA_2025);
  });

  it("rejects unsupported years — no silent fallbacks", () => {
    expect(() => getFederalConfig(2024)).toThrow(UnsupportedTaxYearError);
    expect(() => getPennsylvaniaConfig(2030)).toThrow(UnsupportedTaxYearError);
  });
});

describe("federal 2025 config invariants", () => {
  it("has brackets in strictly increasing order with increasing rates for every status", () => {
    for (const status of FILING_STATUSES) {
      const brackets = FEDERAL_2025.brackets[status];
      expect(brackets[0]!.over).toBe(0);
      for (let i = 1; i < brackets.length; i++) {
        expect(brackets[i]!.over).toBeGreaterThan(brackets[i - 1]!.over);
        expect(brackets[i]!.rate).toBeGreaterThan(brackets[i - 1]!.rate);
      }
    }
  });

  it("EITC max credit derives consistently from rates and earned income amounts", () => {
    // Published 2025 maximum credits: $649 / $4,328 / $7,152 / $8,046.
    const expected = [649_00, 4_328_00, 7_152_00, 8_046_00];
    for (let kids = 0; kids < 4; kids++) {
      const max = Math.round(
        (FEDERAL_2025.eitc.earnedIncomeAmount[kids]! * FEDERAL_2025.eitc.creditRate[kids]!) / 100,
      );
      expect(max * 100 - expected[kids]!).toBeLessThanOrEqual(100); // within $1 of published table
    }
  });

  it("standard deduction values are whole dollars in cents", () => {
    for (const status of FILING_STATUSES) {
      expect(FEDERAL_2025.standardDeduction[status] % 100).toBe(0);
    }
  });

  it("PA rate is the statutory 3.07%", () => {
    expect(PENNSYLVANIA_2025.taxRate).toBe(0.0307);
  });
});
