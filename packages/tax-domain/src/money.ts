/**
 * Money handling for tax calculations.
 *
 * All monetary amounts inside the platform are integer cents. Tax form lines
 * are whole dollars, produced with IRS rounding (50 cents and above rounds up).
 * Keeping everything in integers makes every calculation deterministic and
 * reproducible — floating point never enters a tax computation.
 */

/** An amount in integer cents. */
export type Cents = number;

/** A whole-dollar amount as used on tax form lines. */
export type Dollars = number;

export function assertCents(value: number, label = "amount"): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label} must be integer cents, got ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} exceeds safe integer range`);
  }
}

/** Convert cents to whole dollars using IRS rounding (>= 50 cents rounds away from zero). */
export function centsToWholeDollars(cents: Cents): Dollars {
  assertCents(cents);
  const sign = cents < 0 ? -1 : 1;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  return sign * (remainder >= 50 ? dollars + 1 : dollars);
}

/** Convert whole dollars to cents. */
export function dollarsToCents(dollars: Dollars): Cents {
  if (!Number.isFinite(dollars)) {
    throw new TypeError(`dollars must be finite, got ${dollars}`);
  }
  return Math.round(dollars * 100);
}

/** Sum a list of cent amounts. */
export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc: number, v) => {
    assertCents(v);
    return acc + v;
  }, 0);
}

/** Clamp to zero minimum (used constantly on tax forms: "if less than zero, enter -0-"). */
export function notLessThanZero(cents: Cents): Cents {
  assertCents(cents);
  return cents < 0 ? 0 : cents;
}

export function minCents(a: Cents, b: Cents): Cents {
  assertCents(a);
  assertCents(b);
  return Math.min(a, b);
}

export function maxCents(a: Cents, b: Cents): Cents {
  assertCents(a);
  assertCents(b);
  return Math.max(a, b);
}

/**
 * Multiply a cent amount by a rate expressed in basis points-of-precision
 * (rate given as e.g. 0.0307). Result is rounded to the nearest cent,
 * half away from zero, deterministically.
 */
export function multiplyRate(cents: Cents, rate: number): Cents {
  assertCents(cents);
  if (!Number.isFinite(rate)) {
    throw new TypeError(`rate must be finite, got ${rate}`);
  }
  // Use string-free deterministic rounding: scale rate to a rational with
  // fixed precision (1e-6) to avoid float drift across platforms.
  const rateMicros = Math.round(rate * 1_000_000);
  const product = cents * rateMicros;
  const sign = product < 0 ? -1 : 1;
  const abs = Math.abs(product);
  return sign * Math.floor((abs + 500_000) / 1_000_000);
}

/** Format cents for display, e.g. 123456 -> "$1,234.56". */
export function formatCents(cents: Cents): string {
  assertCents(cents);
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  const remainder = (abs % 100).toString().padStart(2, "0");
  return `${sign}$${dollars}.${remainder}`;
}

/** Format whole dollars for form display, e.g. 1234 -> "$1,234". */
export function formatDollars(dollars: Dollars): string {
  const sign = dollars < 0 ? "-" : "";
  return `${sign}$${Math.abs(dollars).toLocaleString("en-US")}`;
}
