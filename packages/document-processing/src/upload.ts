/**
 * Upload hardening: file-type allowlist enforced by magic bytes (not just
 * extension), size limits, and a malware-scan boundary. Files are stored in
 * private encrypted object storage with pre-signed access only — never
 * public URLs.
 */

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export interface AllowedType {
  mime: string;
  extensions: string[];
  /** Magic-byte prefixes (any match accepts). */
  magic: number[][];
}

export const ALLOWED_TYPES: AllowedType[] = [
  { mime: "application/pdf", extensions: [".pdf"], magic: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
  { mime: "image/jpeg", extensions: [".jpg", ".jpeg"], magic: [[0xff, 0xd8, 0xff]] },
  { mime: "image/png", extensions: [".png"], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  {
    mime: "image/heic",
    extensions: [".heic"],
    // ISO BMFF: offset 4 = "ftyp"; checked specially below.
    magic: [[0x66, 0x74, 0x79, 0x70]],
  },
];

export interface UploadValidation {
  ok: boolean;
  detectedMime?: string;
  reason?: string;
}

export function validateUpload(params: {
  filename: string;
  sizeBytes: number;
  /** First 16 bytes of the file. */
  head: Uint8Array;
}): UploadValidation {
  if (params.sizeBytes <= 0) return { ok: false, reason: "Empty file" };
  if (params.sizeBytes > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `File exceeds the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit` };
  }
  const ext = params.filename.slice(params.filename.lastIndexOf(".")).toLowerCase();
  const byExt = ALLOWED_TYPES.find((t) => t.extensions.includes(ext));
  if (!byExt) {
    return { ok: false, reason: `File type ${ext || "(none)"} is not accepted` };
  }
  const matchesMagic = (offset: number) =>
    byExt.magic.some((sig) => sig.every((b, i) => params.head[offset + i] === b));
  const ok = byExt.mime === "image/heic" ? matchesMagic(4) : matchesMagic(0);
  if (!ok) {
    return {
      ok: false,
      reason: "File contents do not match the declared type (possible spoofed extension)",
    };
  }
  return { ok: true, detectedMime: byExt.mime };
}

/** Malware scanning boundary. Production wires ClamAV or a hosted scanner. */
export interface MalwareScanner {
  scan(content: Uint8Array): Promise<{ clean: boolean; signature?: string }>;
}

/**
 * Development scanner: flags the EICAR test string so the quarantine path is
 * exercisable end-to-end without real malware.
 */
export class EicarTestScanner implements MalwareScanner {
  private static readonly EICAR =
    "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
  async scan(content: Uint8Array): Promise<{ clean: boolean; signature?: string }> {
    const text = Buffer.from(content.slice(0, 4096)).toString("latin1");
    if (text.includes(EicarTestScanner.EICAR)) {
      return { clean: false, signature: "EICAR-Test-Signature" };
    }
    return { clean: true };
  }
}
