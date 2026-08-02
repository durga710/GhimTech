import { describe, expect, it } from "vitest";
import {
  EncryptionError,
  blindIndex,
  decryptField,
  encryptField,
  generateMasterKeyHex,
  parseMasterKey,
} from "./crypto.js";
import { maskBankAccount, maskEmail, maskSsn, scrubSensitive } from "./masking.js";
import { hashPassword, passwordMeetsPolicy, verifyPassword } from "./password.js";
import { generateRecoveryCodes, generateToken, hashToken } from "./tokens.js";
import { base32Decode, generateTotpSecret, otpauthUrl, totpCode, verifyTotp } from "./totp.js";

describe("envelope encryption", () => {
  const masterKey = parseMasterKey(generateMasterKeyHex());

  it("round-trips a value", () => {
    const ciphertext = encryptField("123-45-6789", masterKey);
    expect(ciphertext).not.toContain("123-45-6789");
    expect(ciphertext.startsWith("v1.")).toBe(true);
    expect(decryptField(ciphertext, masterKey)).toBe("123-45-6789");
  });

  it("produces distinct ciphertexts for the same plaintext (random data keys)", () => {
    const a = encryptField("same value", masterKey);
    const b = encryptField("same value", masterKey);
    expect(a).not.toBe(b);
  });

  it("fails with the wrong master key", () => {
    const other = parseMasterKey(generateMasterKeyHex());
    const ciphertext = encryptField("secret", masterKey);
    expect(() => decryptField(ciphertext, other)).toThrow(EncryptionError);
  });

  it("detects tampering", () => {
    const ciphertext = encryptField("secret", masterKey);
    const parts = ciphertext.split(".");
    parts[5] = parts[5]!.slice(0, -2) + "AA";
    expect(() => decryptField(parts.join("."), masterKey)).toThrow(EncryptionError);
  });

  it("rejects malformed master keys", () => {
    expect(() => parseMasterKey(undefined)).toThrow(EncryptionError);
    expect(() => parseMasterKey("abcd")).toThrow(EncryptionError);
  });

  it("blind index is deterministic per key and value", () => {
    const key = Buffer.alloc(32, 7);
    expect(blindIndex("123-45-6789", key)).toBe(blindIndex("123-45-6789", key));
    expect(blindIndex("123-45-6789", key)).not.toBe(blindIndex("123-45-6780", key));
    expect(blindIndex("123-45-6789", Buffer.alloc(32, 8))).not.toBe(blindIndex("123-45-6789", key));
  });
});

describe("masking", () => {
  it("masks SSNs, accounts, EINs, and emails", () => {
    expect(maskSsn("6789")).toBe("***-**-6789");
    expect(maskBankAccount("4321")).toBe("******4321");
    expect(maskEmail("taxpayer@example.com")).toBe("ta******@example.com");
  });

  it("scrubs SSN-shaped and account-shaped strings from log text", () => {
    const scrubbed = scrubSensitive("ssn 123-45-6789 acct 123456789012");
    expect(scrubbed).not.toContain("123-45-6789");
    expect(scrubbed).not.toContain("123456789012");
  });
});

describe("passwords", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("correct horse Battery 42");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse Battery 42", hash)).toBe(true);
    expect(await verifyPassword("wrong password 42", hash)).toBe(false);
  });

  it("rejects malformed stored hashes safely", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
  });

  it("enforces the password policy", () => {
    expect(passwordMeetsPolicy("short").ok).toBe(false);
    expect(passwordMeetsPolicy("alllowercasebutlong").ok).toBe(false);
    expect(passwordMeetsPolicy("Str0ngEnoughPass").ok).toBe(true);
  });
});

describe("TOTP", () => {
  it("matches the RFC 6238 SHA-1 test vector", () => {
    // RFC 6238 test secret (ASCII "12345678901234567890"), T=59 → 8-digit 94287082 → 6-digit 287082
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(base32Decode(secret).toString("ascii")).toBe("12345678901234567890");
    expect(totpCode(secret, 59_000)).toBe("287082");
  });

  it("verifies within the drift window and rejects outside it", () => {
    const secret = generateTotpSecret();
    const now = 1_700_000_000_000;
    const code = totpCode(secret, now);
    expect(verifyTotp(secret, code, now)).toBe(true);
    expect(verifyTotp(secret, code, now + 30_000)).toBe(true); // one step later
    expect(verifyTotp(secret, code, now + 120_000)).toBe(false);
    expect(verifyTotp(secret, "000000", now)).toBe(code === "000000");
  });

  it("builds an otpauth URL for authenticator apps", () => {
    const url = otpauthUrl("ABC234", "preparer@ghimtech.example");
    expect(url).toContain("otpauth://totp/");
    expect(url).toContain("issuer=GhimTech%20Tax");
  });
});

describe("tokens", () => {
  it("generates unique tokens and stable hashes", () => {
    const token = generateToken();
    expect(generateToken()).not.toBe(token);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toHaveLength(64);
  });

  it("generates well-formed recovery codes", () => {
    const codes = generateRecoveryCodes(8);
    expect(codes).toHaveLength(8);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    }
    expect(new Set(codes).size).toBe(8);
  });
});
