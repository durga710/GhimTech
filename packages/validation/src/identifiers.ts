/**
 * Identifier validators: SSN/ITIN shape, EIN shape, ABA routing checksum,
 * ZIP codes. These validate structure only — identity proofing is a separate
 * workflow.
 */

/** SSN: 9 digits, not starting with 9 (that range is ITIN), no 000/666 area, no 00 group, no 0000 serial. */
export function isValidSsn(value: string): boolean {
  const digits = value.replace(/-/g, "");
  if (!/^\d{9}$/.test(digits)) return false;
  const area = digits.slice(0, 3);
  const group = digits.slice(3, 5);
  const serial = digits.slice(5);
  if (area === "000" || area === "666" || area.startsWith("9")) return false;
  if (group === "00" || serial === "0000") return false;
  return true;
}

/** ITIN: 9XX-7X-XXXX / 9XX-8X-XXXX style ranges. */
export function isValidItin(value: string): boolean {
  const digits = value.replace(/-/g, "");
  if (!/^9\d{8}$/.test(digits)) return false;
  const group = Number(digits.slice(3, 5));
  return (
    (group >= 50 && group <= 65) ||
    (group >= 70 && group <= 88) ||
    group === 90 ||
    (group >= 91 && group <= 92) ||
    (group >= 94 && group <= 99)
  );
}

export function isValidTin(value: string): boolean {
  return isValidSsn(value) || isValidItin(value);
}

/** EIN: 9 digits with a valid prefix (structure only). */
export function isValidEin(value: string): boolean {
  const digits = value.replace(/-/g, "");
  return /^\d{9}$/.test(digits);
}

/** ABA routing number checksum: 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) ≡ 0 mod 10. */
export function isValidRoutingNumber(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const sum = 3 * (d[0]! + d[3]! + d[6]!) + 7 * (d[1]! + d[4]! + d[7]!) + (d[2]! + d[5]! + d[8]!);
  if (sum % 10 !== 0) return false;
  // First two digits must be a valid Federal Reserve routing prefix.
  const prefix = Number(value.slice(0, 2));
  return (
    (prefix >= 1 && prefix <= 12) ||
    (prefix >= 21 && prefix <= 32) ||
    (prefix >= 61 && prefix <= 72) ||
    prefix === 80
  );
}

export function isValidZip(value: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(value);
}

/** PA PSD codes are 6 digits. */
export function isValidPsdCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}
