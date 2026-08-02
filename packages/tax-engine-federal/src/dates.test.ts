import { describe, expect, it } from 'vitest';
import {
  ageForYearEndTest,
  ageOn,
  compareIsoDates,
  daysInMonth,
  isAfter,
  isIsoDate,
  isLeapYear,
  isOnOrBefore,
  parseIsoDate,
  yearOf,
} from './dates.js';

describe('isLeapYear', () => {
  it('applies the full Gregorian rule, not just the divisible-by-four shortcut', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe('daysInMonth', () => {
  it('gives February an extra day only in a leap year', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(1900, 2)).toBe(28);
  });

  it('knows the thirty-day months', () => {
    expect(daysInMonth(2025, 4)).toBe(30);
    expect(daysInMonth(2025, 6)).toBe(30);
    expect(daysInMonth(2025, 9)).toBe(30);
    expect(daysInMonth(2025, 11)).toBe(30);
    expect(daysInMonth(2025, 1)).toBe(31);
    expect(daysInMonth(2025, 12)).toBe(31);
  });
});

describe('parseIsoDate', () => {
  it('parses a well-formed date into components', () => {
    expect(parseIsoDate('2025-06-15')).toEqual({ year: 2025, month: 6, day: 15 });
    expect(parseIsoDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it('rejects dates that do not exist on the calendar', () => {
    expect(parseIsoDate('2025-02-30')).toBeUndefined();
    expect(parseIsoDate('2025-02-29')).toBeUndefined();
    expect(parseIsoDate('2025-04-31')).toBeUndefined();
    expect(parseIsoDate('2025-13-01')).toBeUndefined();
    expect(parseIsoDate('2025-00-10')).toBeUndefined();
    expect(parseIsoDate('2025-06-00')).toBeUndefined();
  });

  it('rejects anything that is not exactly YYYY-MM-DD', () => {
    expect(parseIsoDate('2025-6-15')).toBeUndefined();
    expect(parseIsoDate('20250615')).toBeUndefined();
    expect(parseIsoDate('06/15/2025')).toBeUndefined();
    expect(parseIsoDate('2025-06-15T00:00:00Z')).toBeUndefined();
    expect(parseIsoDate('')).toBeUndefined();
  });

  it('agrees with isIsoDate', () => {
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2025-02-30')).toBe(false);
  });
});

describe('compareIsoDates', () => {
  it('orders well-formed dates', () => {
    expect(compareIsoDates('2025-01-01', '2025-01-02')).toBe(-1);
    expect(compareIsoDates('2025-01-02', '2025-01-01')).toBe(1);
    expect(compareIsoDates('2025-01-01', '2025-01-01')).toBe(0);
    expect(compareIsoDates('2024-12-31', '2025-01-01')).toBe(-1);
  });

  it('refuses to guess when either side is unusable', () => {
    // Returning undefined rather than 0 forces the caller to decide what an
    // unparseable date means instead of quietly treating it as equal.
    expect(compareIsoDates('not-a-date', '2025-01-01')).toBeUndefined();
    expect(compareIsoDates('2025-01-01', '2025-02-30')).toBeUndefined();
  });
});

describe('isOnOrBefore and isAfter', () => {
  it('handle the inclusive boundary', () => {
    expect(isOnOrBefore('2025-01-01', '2025-01-01')).toBe(true);
    expect(isOnOrBefore('2025-01-01', '2025-01-02')).toBe(true);
    expect(isOnOrBefore('2025-01-02', '2025-01-01')).toBe(false);
    expect(isAfter('2025-01-02', '2025-01-01')).toBe(true);
    expect(isAfter('2025-01-01', '2025-01-01')).toBe(false);
  });

  it('treat unusable input as false in both directions', () => {
    expect(isOnOrBefore('garbage', '2025-01-01')).toBe(false);
    expect(isAfter('garbage', '2025-01-01')).toBe(false);
  });
});

describe('ageOn', () => {
  it('increments age on the birthday itself, not the day before', () => {
    expect(ageOn('2008-06-15', '2025-06-14')).toBe(16);
    expect(ageOn('2008-06-15', '2025-06-15')).toBe(17);
    expect(ageOn('2008-06-15', '2025-06-16')).toBe(17);
  });

  it('handles a birthday later in the year than the test date', () => {
    expect(ageOn('2008-12-31', '2025-12-30')).toBe(16);
    expect(ageOn('2008-12-31', '2025-12-31')).toBe(17);
    expect(ageOn('2008-01-01', '2025-12-31')).toBe(17);
  });

  it('returns zero in the year of birth and undefined for unusable dates', () => {
    expect(ageOn('2025-03-01', '2025-12-31')).toBe(0);
    expect(ageOn('2025-02-30', '2025-12-31')).toBeUndefined();
    expect(ageOn('2000-01-01', 'not-a-date')).toBeUndefined();
  });
});

describe('ageForYearEndTest', () => {
  it('treats a January 1 birthday as reached on December 31 of the prior year', () => {
    // Someone born 1961-01-01 turns 65 on 2026-01-01, but the IRS treats them
    // as 65 at the close of 2025 for the additional standard deduction.
    expect(ageOn('1961-01-01', '2025-12-31')).toBe(64);
    expect(ageForYearEndTest('1961-01-01', 2025)).toBe(65);
  });

  it('leaves every other birthday alone', () => {
    expect(ageForYearEndTest('1961-01-02', 2025)).toBe(64);
    expect(ageForYearEndTest('1960-12-31', 2025)).toBe(65);
    expect(ageForYearEndTest('2009-01-01', 2025)).toBe(17);
    expect(ageForYearEndTest('2009-01-02', 2025)).toBe(16);
  });

  it('returns undefined for an unusable date of birth', () => {
    expect(ageForYearEndTest('2025-02-30', 2025)).toBeUndefined();
  });
});

describe('yearOf', () => {
  it('extracts the calendar year, or nothing at all', () => {
    expect(yearOf('2025-06-15')).toBe(2025);
    expect(yearOf('1999-12-31')).toBe(1999);
    expect(yearOf('2025-02-30')).toBeUndefined();
  });
});
