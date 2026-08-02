/**
 * TOTP (RFC 6238) for MFA — implemented on Node's crypto, no dependencies.
 * 30-second steps, 6 digits, SHA-1 per authenticator-app convention.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(
  secret: string,
  timestampMs: number,
  stepSeconds = 30,
  digits = 6,
): string {
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", base32Decode(secret)).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    (((hmac[offset]! & 0x7f) << 24) |
      (hmac[offset + 1]! << 16) |
      (hmac[offset + 2]! << 8) |
      hmac[offset + 3]!) %
    10 ** digits;
  return code.toString().padStart(digits, "0");
}

/** Verify with a ±1 step window for clock drift. */
export function verifyTotp(
  secret: string,
  submitted: string,
  timestampMs: number,
  window = 1,
): boolean {
  if (!/^\d{6}$/.test(submitted)) return false;
  const submittedBuf = Buffer.from(submitted);
  for (let i = -window; i <= window; i++) {
    const expected = Buffer.from(totpCode(secret, timestampMs + i * 30_000));
    if (expected.length === submittedBuf.length && timingSafeEqual(expected, submittedBuf)) {
      return true;
    }
  }
  return false;
}

export function otpauthUrl(secret: string, accountName: string, issuer = "GhimTech Tax"): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
