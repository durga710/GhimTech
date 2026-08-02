import { describe, expect, it } from 'vitest';
import {
  applyRate,
  difference,
  dollars,
  formatMoney,
  isValidMoney,
  sumMoney,
  toDollars,
} from './money.js';

describe('dollars and toDollars', () => {
  it('converts dollars to whole cents', () => {
    expect(dollars(0)).toBe(0);
    expect(dollars(1)).toBe(100);
    expect(dollars(12.34)).toBe(1234);
    expect(dollars(60_000)).toBe(6_000_000);
    expect(dollars(-45.67)).toBe(-4567);
  });

  it('rounds a fractional cent rather than carrying it', () => {
    // 19.999 dollars is not a representable amount of money; the alternative to
    // rounding here is a float that drifts through every later addition.
    expect(dollars(19.999)).toBe(2000);
    expect(dollars(0.005)).toBe(1);
  });

  it('round-trips back to dollars', () => {
    expect(toDollars(1234)).toBe(12.34);
    expect(toDollars(0)).toBe(0);
    expect(toDollars(-4567)).toBe(-45.67);
  });
});

describe('isValidMoney', () => {
  it('accepts safe integers only', () => {
    expect(isValidMoney(0)).toBe(true);
    expect(isValidMoney(1234)).toBe(true);
    expect(isValidMoney(-1234)).toBe(true);
  });

  it('rejects fractional cents, non-finite values and non-numbers', () => {
    expect(isValidMoney(12.5)).toBe(false);
    expect(isValidMoney(Number.NaN)).toBe(false);
    expect(isValidMoney(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidMoney(Number.MAX_SAFE_INTEGER + 2)).toBe(false);
    expect(isValidMoney('1234')).toBe(false);
    expect(isValidMoney(undefined)).toBe(false);
    expect(isValidMoney(null)).toBe(false);
  });
});

describe('sumMoney', () => {
  it('adds cents exactly and skips undefined entries', () => {
    expect(sumMoney([])).toBe(0);
    expect(sumMoney([100, 250])).toBe(350);
    expect(sumMoney([100, undefined, 250, undefined])).toBe(350);
    expect(sumMoney([dollars(0.1), dollars(0.2)])).toBe(30);
  });

  it('sums a hundred one-cent amounts to exactly one dollar', () => {
    // The same addition in floating point dollars lands on 1.0000000000000007.
    expect(sumMoney(Array.from({ length: 100 }, () => 1))).toBe(100);
  });
});

describe('applyRate', () => {
  it('applies statutory rates to whole cents', () => {
    expect(applyRate(dollars(60_000), 0.062)).toBe(dollars(3_720));
    expect(applyRate(dollars(60_000), 0.0145)).toBe(dollars(870));
    expect(applyRate(dollars(176_100), 0.062)).toBe(dollars(10_918.2));
  });

  it('rounds a half cent up', () => {
    expect(applyRate(333, 0.5)).toBe(167);
    expect(applyRate(331, 0.5)).toBe(166);
  });

  it('returns zero for a zero amount or a zero rate', () => {
    expect(applyRate(0, 0.062)).toBe(0);
    expect(applyRate(dollars(1_000), 0)).toBe(0);
  });
});

describe('difference', () => {
  it('is symmetric', () => {
    expect(difference(500, 300)).toBe(200);
    expect(difference(300, 500)).toBe(200);
    expect(difference(400, 400)).toBe(0);
  });
});

describe('formatMoney', () => {
  it('renders cents with a thousands separator', () => {
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(5)).toBe('$0.05');
    expect(formatMoney(50)).toBe('$0.50');
    expect(formatMoney(123_456)).toBe('$1,234.56');
    expect(formatMoney(100_000_000)).toBe('$1,000,000.00');
  });

  it('renders a negative amount with the sign before the currency symbol', () => {
    expect(formatMoney(-123_456)).toBe('-$1,234.56');
    expect(formatMoney(-5)).toBe('-$0.05');
  });

  it('pads a single-digit cent figure', () => {
    expect(formatMoney(101)).toBe('$1.01');
    expect(formatMoney(110)).toBe('$1.10');
  });
});
