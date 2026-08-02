"use client";
/**
 * Document vault: upload with client-side size guard (the API re-validates
 * type by magic bytes and scans content), OCR suggestions, and verification.
 */
import { useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Select,
  Skeleton,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { api, getUser } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface DocRow {
  id: string;
  clientId: string;
  category: string;
  status: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
}
interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
}

export default function DocumentsPage() {
  const user = getUser();
  const isClient = user?.role === "CLIENT";
  const clients = useApi<ClientRow[]>(isClient ? null : "/clients");
  const docs = useApi<DocRow[]>("/documents");
  const [clientId, setClientId] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string }>();
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setNotice(undefined);
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error("Files are limited to 25 MB");
      const buffer = await file.arrayBuffer();
      const contentBase64 = btoa(
        Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(""),
      );
      const result = await api<{ category: string }>("/documents", {
        method: "POST",
        body: {
          filename: file.name,
          contentBase64,
          ...(isClient ? {} : { clientId }),
        },
      });
      setNotice({
        tone: "success",
        text: `Uploaded and scanned. Detected category: ${result.category}. OCR values await human verification.`,
      });
      await docs.refetch();
    } catch (err) {
      setNotice({ tone: "danger", text: (err as Error).message });
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Document vault</h1>
        <p className="text-sm text-slate-500">
          Encrypted storage with malware scanning; OCR suggestions always require human verification
          before entering a return.
        </p>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-end gap-4">
          {!isClient && (
            <div className="w-64">
              <label className="mb-1.5 block text-[13px] font-medium">Client</label>
              <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Select a client…</option>
                {(clients.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.lastName}, {c.firstName}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.heic,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button
              onClick={() => fileInput.current?.click()}
              disabled={busy || (!isClient && !clientId)}
            >
              {busy ? "Uploading…" : "Choose file…"}
            </Button>
          </div>
          <p className="text-xs text-slate-400">PDF, PNG, JPEG, HEIC · 25 MB max</p>
        </CardBody>
      </Card>

      <Card>
        {docs.loading ? (
          <CardBody>
            <Skeleton className="h-24" />
          </CardBody>
        ) : (docs.data ?? []).length === 0 ? (
          <CardBody>
            <EmptyState
              title="No documents yet"
              hint="Upload W-2s, 1099s, IDs, and supporting records."
            />
          </CardBody>
        ) : (
          <Table>
            <THead columns={["File", "Category", "Status", "Size", "Uploaded"]} />
            <tbody>
              {(docs.data ?? []).map((doc) => (
                <TRow key={doc.id}>
                  <TCell className="font-medium">{doc.filename}</TCell>
                  <TCell>
                    <Badge tone="brand">{doc.category.replaceAll("_", " ")}</Badge>
                  </TCell>
                  <TCell>
                    <Badge tone={doc.status === "VERIFIED" ? "success" : "warning"}>
                      {doc.status.replaceAll("_", " ")}
                    </Badge>
                  </TCell>
                  <TCell className="tabular-nums">{Math.ceil(doc.sizeBytes / 1024)} KB</TCell>
                  <TCell className="text-slate-400">{doc.createdAt.slice(0, 10)}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
