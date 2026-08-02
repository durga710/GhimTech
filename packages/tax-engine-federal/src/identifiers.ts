/**
 * Structural validation for the identifiers that appear on a Federal return.
 *
 * These checks are deliberately offline and structural. They catch the
 * transcription errors that cause the overwhelming majority of Modernized
 * e-File (MeF) rejects before a return is ever transmitted. They cannot and do
 * not assert that an identifier was actually issued — only the IRS and SSA can
 * confirm that, and those checks happen at the gateway.
 */

/** How a nine-digit taxpayer identification number was issued. */
export type TinKind = 'ssn' | 'itin' | 'atin' | 'invalid';

const NINE_DIGITS = /^\d{9}$/;

/** Strip formatting (spaces, hyphens) from an identifier. */
export function normalizeTin(value: string): string {
  return value.replace(/[\s-]/g, '');
}

function parts(value: string): { area: number; group: number; serial: number } | undefined {
  const normalized = normalizeTin(value);
  if (!NINE_DIGITS.test(normalized)) return undefined;
  return {
    area: Number(normalized.slice(0, 3)),
    group: Number(normalized.slice(3, 5)),
    serial: Number(normalized.slice(5, 9)),
  };
}

/**
 * A true Social Security Number. Area 000, 666 and 900-999 were never issued;
 * a zero group or zero serial is likewise impossible.
 */
export function isValidSsn(value: string): boolean {
  const p = parts(value);
  if (!p) return false;
  if (p.area === 0 || p.area === 666 || p.area >= 900) return false;
  return p.group !== 0 && p.serial !== 0;
}

/** ITIN group ranges assigned by the IRS (IRM 3.21.263). */
const ITIN_GROUPS: ReadonlyArray<readonly [number, number]> = [
  [50, 65],
  [70, 88],
  [90, 92],
  [94, 99],
];

/** An Individual Taxpayer Identification Number: area 9xx with an ITIN group. */
export function isValidItin(value: string): boolean {
  const p = parts(value);
  if (!p) return false;
  if (p.area < 900 || p.area > 999) return false;
  if (p.serial === 0) return false;
  return ITIN_GROUPS.some(([low, high]) => p.group >= low && p.group <= high);
}

/** An Adoption Taxpayer Identification Number: area 9xx, group 93. */
export function isValidAtin(value: string): boolean {
  const p = parts(value);
  if (!p) return false;
  return p.area >= 900 && p.area <= 999 && p.group === 93 && p.serial !== 0;
}

/** Classify a nine-digit identifier, or `'invalid'` if it matches no scheme. */
export function classifyTin(value: string): TinKind {
  if (isValidSsn(value)) return 'ssn';
  if (isValidItin(value)) return 'itin';
  if (isValidAtin(value)) return 'atin';
  return 'invalid';
}

/** True for any identifier the IRS will accept in a TIN field. */
export function isValidTin(value: string): boolean {
  return classifyTin(value) !== 'invalid';
}

/**
 * Only a true SSN is "valid for employment" for purposes of the Earned Income
 * Credit and the refundable portion of the Child Tax Credit. An ITIN or ATIN
 * holder may still qualify for the Credit for Other Dependents.
 */
export function isEmploymentAuthorizedTin(value: string): boolean {
  return isValidSsn(value);
}

/** Render a TIN as `123-45-6789`; returns the input unchanged if malformed. */
export function formatTin(value: string): string {
  const normalized = normalizeTin(value);
  if (!NINE_DIGITS.test(normalized)) return value;
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 5)}-${normalized.slice(5, 9)}`;
}

/**
 * Render a TIN with only the last four digits visible. Diagnostic messages are
 * written to preparer logs and support tickets, so they never carry a full TIN.
 */
export function maskTin(value: string): string {
  const normalized = normalizeTin(value);
  if (normalized.length < 4) return '***-**-****';
  return `***-**-${normalized.slice(-4)}`;
}

/**
 * Employer Identification Number: nine digits. A run of a single repeated digit
 * is never issued and is the usual signature of a placeholder value typed into
 * a W-2 by hand.
 */
export function isValidEin(value: string): boolean {
  const normalized = normalizeTin(value);
  if (!NINE_DIGITS.test(normalized)) return false;
  if (normalized.startsWith('00')) return false;
  return !/^(\d)\1{8}$/.test(normalized);
}

/** Render an EIN as `12-3456789`; returns the input unchanged if malformed. */
export function formatEin(value: string): string {
  const normalized = normalizeTin(value);
  if (!NINE_DIGITS.test(normalized)) return value;
  return `${normalized.slice(0, 2)}-${normalized.slice(2)}`;
}

const ABA_WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1] as const;

/**
 * ABA routing transit number check: the weighted digit sum must be divisible by
 * ten. A mistyped routing number is the single most common cause of a refund
 * being converted to a paper check weeks after filing.
 */
export function isValidRoutingNumber(value: string): boolean {
  const normalized = normalizeTin(value);
  if (!NINE_DIGITS.test(normalized)) return false;
  let sum = 0;
  for (const [index, weight] of ABA_WEIGHTS.entries()) {
    sum += Number(normalized.charAt(index)) * weight;
  }
  return sum % 10 === 0;
}

/**
 * The IRS accepts direct deposit only to routing numbers whose first two digits
 * fall in a Federal Reserve (01-12) or thrift (21-32) range. Electronic-only
 * and traveler's-check prefixes are rejected.
 */
export function isDirectDepositRoutingNumber(value: string): boolean {
  if (!isValidRoutingNumber(value)) return false;
  const prefix = Number(normalizeTin(value).slice(0, 2));
  return (prefix >= 1 && prefix <= 12) || (prefix >= 21 && prefix <= 32);
}

/** Deposit account numbers are alphanumeric, 1-17 characters, no separators. */
export function isValidBankAccountNumber(value: string): boolean {
  return /^[A-Za-z0-9]{1,17}$/.test(value.trim());
}

/** Five-digit or ZIP+4 postal code. */
export function isValidZipCode(value: string): boolean {
  return /^\d{5}(-?\d{4})?$/.test(value.trim());
}

/** State, district, territory and military post codes accepted by MeF. */
export const US_STATE_CODES: ReadonlySet<string> = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO',
  'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'AS', 'FM', 'GU', 'MH', 'MP', 'PR', 'PW', 'VI',
  'AA', 'AE', 'AP',
]);

/** True for a two-letter code MeF will accept in a state field. */
export function isValidStateCode(value: string): boolean {
  return US_STATE_CODES.has(value.trim().toUpperCase());
}

/** A PIN of the given length, not consisting entirely of zeros. */
export function isValidPin(value: string, length: number): boolean {
  if (!new RegExp(`^\\d{${length}}$`).test(value)) return false;
  return !/^0+$/.test(value);
}
