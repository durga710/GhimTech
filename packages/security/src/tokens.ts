/**
 * Opaque token utilities for sessions and recovery codes. Tokens are stored
 * only as SHA-256 digests — a database leak never yields usable tokens.
 */
import { createHash, randomBytes } from "node:crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Human-typable recovery codes, e.g. "K7QX-2MNP-9RTW". */
export function generateRecoveryCodes(count = 10): string[] {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(12);
    let code = "";
    for (let j = 0; j < 12; j++) {
      code += alphabet[raw[j]! % alphabet.length];
      if (j === 3 || j === 7) code += "-";
    }
    codes.push(code);
  }
  return codes;
}
