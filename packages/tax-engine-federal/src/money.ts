/**
 * Monetary amounts are stored as a whole number of cents.
 *
 * Tax computation cannot tolerate binary floating point drift: a return that is
 * off by a penny fails IRS totals-consistency business rules and is rejected at
 * the Modernized e-File gateway. Every amount in this package is an integer.
 */
export type Money = number;

/** Convert a dollar figure (possibly with cents) to `Money`. */
export function dollars(amount: number): Money {
  return Math.round(amount * 100);
}

/** Convert `Money` back to a floating point dollar figure. For display only. */
export function toDollars(amount: Money): number {
  return amount / 100;
}

/** True when the value is a usable monetary amount (finite, integral cents). */
export function isValidMoney(amount: unknown): amount is Money {
  return typeof amount === 'number' && Number.isSafeInteger(amount);
}

/** Sum a list of amounts, ignoring `undefined` entries. */
export function sumMoney(amounts: ReadonlyArray<Money | undefined>): Money {
  let total = 0;
  for (const amount of amounts) {
    if (amount !== undefined) total += amount;
  }
  return total;
}

/**
 * Apply a rate to an amount and round half-up to the nearest cent, matching the
 * rounding convention the IRS uses for withholding and tax table lookups.
 */
export function applyRate(amount: Money, rate: number): Money {
  return Math.round(amount * rate);
}

/** Absolute difference between two amounts. */
export function difference(a: Money, b: Money): Money {
  return Math.abs(a - b);
}

/** Format `Money` for diagnostic messages, e.g. `$1,234.56`. */
export function formatMoney(amount: Money): string {
  const negative = amount < 0;
  const cents = Math.abs(amount) % 100;
  const whole = Math.floor(Math.abs(amount) / 100);
  const grouped = whole.toLocaleString('en-US');
  return `${negative ? '-' : ''}$${grouped}.${String(cents).padStart(2, '0')}`;
}
