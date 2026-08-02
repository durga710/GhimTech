import { describe, expect, it } from "vitest";
import {
  centsToWholeDollars,
  dollarsToCents,
  formatCents,
  formatDollars,
  multiplyRate,
  notLessThanZero,
  sumCents,
} from "./money.js";

describe("centsToWholeDollars (IRS rounding)", () => {
  it("rounds 49 cents down", () => {
    expect(centsToWholeDollars(12_349)).toBe(123);
  });
  it("rounds 50 cents up", () => {
    expect(centsToWholeDollars(12_350)).toBe(124);
  });
  it("handles zero", () => {
    expect(centsToWholeDollars(0)).toBe(0);
  });
  it("rounds negative amounts away from zero at 50 cents", () => {
    expect(centsToWholeDollars(-12_350)).toBe(-124);
    expect(centsToWholeDollars(-12_349)).toBe(-123);
  });
  it("rejects non-integer cents", () => {
    expect(() => centsToWholeDollars(1.5)).toThrow(TypeError);
  });
});

describe("multiplyRate", () => {
  it("applies the PA flat rate deterministically", () => {
    // $50,000.00 × 3.07% = $1,535.00
    expect(multiplyRate(5_000_000, 0.0307)).toBe(153_500);
  });
  it("rounds half up at the cent", () => {
    // 101 cents × 0.5 = 50.5 cents → 51
    expect(multiplyRate(101, 0.5)).toBe(51);
  });
  it("handles negative amounts symmetrically", () => {
    expect(multiplyRate(-101, 0.5)).toBe(-51);
  });
});

describe("helpers", () => {
  it("sums cents", () => {
    expect(sumCents([100, 250, 50])).toBe(400);
  });
  it("clamps negatives to zero", () => {
    expect(notLessThanZero(-500)).toBe(0);
    expect(notLessThanZero(500)).toBe(500);
  });
  it("converts dollars to cents", () => {
    expect(dollarsToCents(1234.56)).toBe(123_456);
  });
  it("formats amounts", () => {
    expect(formatCents(123_456)).toBe("$1,234.56");
    expect(formatCents(-50)).toBe("-$0.50");
    expect(formatDollars(15_750)).toBe("$15,750");
  });
});
