/**
 * Field-level envelope encryption.
 *
 * Highly sensitive values (SSNs, bank account numbers, signature payloads,
 * document keys) are encrypted with a per-record data key (AES-256-GCM),
 * and the data key is wrapped by the master key (also AES-256-GCM). The
 * master key comes from the environment (`GHIMTECH_MASTER_KEY`, 32 bytes
 * hex) and, in production, from a KMS-backed secret. Rotating the master key
 * only requires re-wrapping data keys, not re-encrypting the data.
 *
 * Ciphertext format (versioned, dot-separated base64url):
 *   v1.<wrappedKeyIv>.<wrappedKey>.<wrappedKeyTag>.<dataIv>.<ciphertext>.<dataTag>
 */
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGO = "aes-256-gcm";

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionError";
  }
}

function b64(buf: Buffer): string {
  return buf.toString("base64url");
}
function unb64(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function parseMasterKey(hex: string | undefined): Buffer {
  if (!hex) throw new EncryptionError("Master key is not configured (GHIMTECH_MASTER_KEY)");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new EncryptionError("Master key must be 32 bytes of hex");
  return key;
}

/** Generate a new random master key (operator utility). */
export function generateMasterKeyHex(): string {
  return randomBytes(32).toString("hex");
}

export function encryptField(plaintext: string, masterKey: Buffer): string {
  if (masterKey.length !== 32) throw new EncryptionError("Invalid master key length");
  const dataKey = randomBytes(32);

  const dataIv = randomBytes(12);
  const dataCipher = createCipheriv(ALGO, dataKey, dataIv);
  const ciphertext = Buffer.concat([dataCipher.update(plaintext, "utf8"), dataCipher.final()]);
  const dataTag = dataCipher.getAuthTag();

  const wrapIv = randomBytes(12);
  const wrapCipher = createCipheriv(ALGO, masterKey, wrapIv);
  const wrappedKey = Buffer.concat([wrapCipher.update(dataKey), wrapCipher.final()]);
  const wrapTag = wrapCipher.getAuthTag();

  return [
    VERSION,
    b64(wrapIv),
    b64(wrappedKey),
    b64(wrapTag),
    b64(dataIv),
    b64(ciphertext),
    b64(dataTag),
  ].join(".");
}

export function decryptField(payload: string, masterKey: Buffer): string {
  const parts = payload.split(".");
  if (parts.length !== 7 || parts[0] !== VERSION) {
    throw new EncryptionError("Unrecognized ciphertext format");
  }
  const [, wrapIv, wrappedKey, wrapTag, dataIv, ciphertext, dataTag] = parts;
  try {
    const unwrap = createDecipheriv(ALGO, masterKey, unb64(wrapIv!));
    unwrap.setAuthTag(unb64(wrapTag!));
    const dataKey = Buffer.concat([unwrap.update(unb64(wrappedKey!)), unwrap.final()]);

    const decipher = createDecipheriv(ALGO, dataKey, unb64(dataIv!));
    decipher.setAuthTag(unb64(dataTag!));
    return Buffer.concat([decipher.update(unb64(ciphertext!)), decipher.final()]).toString("utf8");
  } catch {
    throw new EncryptionError("Decryption failed — wrong key or tampered ciphertext");
  }
}

/**
 * Deterministic blind index for equality lookups over encrypted fields
 * (e.g. "does this SSN already exist?") without storing the value.
 * Uses HMAC-SHA256 with a dedicated index key — never the master key.
 */
export function blindIndex(value: string, indexKey: Buffer): string {
  return createHmac("sha256", indexKey).update(value.normalize("NFKC")).digest("hex");
}
