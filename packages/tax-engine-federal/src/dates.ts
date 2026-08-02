/**
 * Calendar helpers for age, residency and signature-date tests.
 *
 * Dates on a return are plain calendar dates, never instants. They are stored
 * as `YYYY-MM-DD` strings and compared lexically or by component so that no
 * time zone can shift a birthday across a year boundary and silently change a
 * taxpayer's age — and with it their credit eligibility.
 */

/** A calendar date in `YYYY-MM-DD` form. */
export type IsoDate = string;

const ISO_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** Parse `YYYY-MM-DD`, rejecting impossible calendar dates such as 2025-02-30. */
export function parseIsoDate(value: string): DateParts | undefined {
  const match = ISO_SHAPE.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > daysInMonth(year, month)) return undefined;
  return { year, month, day };
}

/** True when the string is a well-formed, real calendar date. */
export function isIsoDate(value: string): boolean {
  return parseIsoDate(value) !== undefined;
}

/** Number of days in a given month, honouring the Gregorian leap rule. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Order two calendar dates: negative when `a` precedes `b`. Both must be
 * well-formed; `undefined` is returned when either is not, so callers are
 * forced to decide what an unparseable date means rather than defaulting to a
 * silent "equal".
 */
export function compareIsoDates(a: string, b: string): number | undefined {
  if (!isIsoDate(a) || !isIsoDate(b)) return undefined;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** True when `a` falls on or before `b`. Unparseable input yields `false`. */
export function isOnOrBefore(a: string, b: string): boolean {
  const order = compareIsoDates(a, b);
  return order !== undefined && order <= 0;
}

/** True when `a` falls strictly after `b`. Unparseable input yields `false`. */
export function isAfter(a: string, b: string): boolean {
  return compareIsoDates(a, b) === 1;
}

/**
 * Age attained on a given date, by the birthday convention: a taxpayer born on
 * 2008-06-15 is 17 on 2025-06-15 and 16 the day before.
 *
 * The IRS applies a different convention to a handful of elections — the age-65
 * additional standard deduction treats someone born on January 1 as having
 * reached 65 on December 31 of the prior year. Rules that need that behaviour
 * must use {@link ageForYearEndTest}, not this function.
 */
export function ageOn(dateOfBirth: string, onDate: string): number | undefined {
  const birth = parseIsoDate(dateOfBirth);
  const target = parseIsoDate(onDate);
  if (!birth || !target) return undefined;
  let age = target.year - birth.year;
  const beforeBirthday =
    target.month < birth.month || (target.month === birth.month && target.day < birth.day);
  if (beforeBirthday) age -= 1;
  return age;
}

/**
 * Age at the close of the tax year under the IRS January-1 convention: a person
 * born on January 1 is treated as having reached their next age on December 31
 * of the preceding year.
 */
export function ageForYearEndTest(dateOfBirth: string, taxYear: number): number | undefined {
  const birth = parseIsoDate(dateOfBirth);
  if (!birth) return undefined;
  const yearEndAge = ageOn(dateOfBirth, `${taxYear}-12-31`);
  if (yearEndAge === undefined) return undefined;
  return birth.month === 1 && birth.day === 1 ? yearEndAge + 1 : yearEndAge;
}

/** The calendar year component of a date, or `undefined` if unparseable. */
export function yearOf(value: string): number | undefined {
  return parseIsoDate(value)?.year;
}
