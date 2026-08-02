"use client";
import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  StatusBadge,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tinMasked: string;
  dateOfBirth: string;
  address: { line1: string; city: string; state: string; zip: string };
}
interface ReturnRow {
  id: string;
  taxYear: number;
  status: string;
  updatedAt: string;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const client = useApi<ClientDetail>(`/clients/${id}`);
  const returns = useApi<ReturnRow[]>(`/returns?clientId=${id}`);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function startReturn() {
    setBusy(true);
    setError(undefined);
    try {
      const created = await api<{ id: string }>("/returns", {
        method: "POST",
        body: { clientId: id, taxYear: 2025, filingStatus: "SINGLE", includePennsylvania: true },
      });
      router.push(`/returns/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (client.loading) return <Skeleton className="h-48" />;
  if (client.error) return <Alert tone="danger">{client.error}</Alert>;
  const c = client.data!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {c.lastName}, {c.firstName}
          </h1>
          <p className="text-sm text-slate-500">
            {c.email} · SSN <span className="font-mono">{c.tinMasked}</span>
          </p>
        </div>
        <Button onClick={startReturn} disabled={busy}>
          {busy ? "Creating…" : "Start 2025 return"}
        </Button>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Address:</span> {c.address.line1}, {c.address.city},{" "}
              {c.address.state} {c.address.zip}
            </p>
            <p>
              <span className="text-slate-500">Date of birth:</span> {c.dateOfBirth}
            </p>
            <p>
              <span className="text-slate-500">Phone:</span> {c.phone ?? "—"}
            </p>
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Returns</CardTitle>
            </CardHeader>
            {returns.loading ? (
              <CardBody>
                <Skeleton className="h-20" />
              </CardBody>
            ) : (returns.data ?? []).length === 0 ? (
              <CardBody>
                <EmptyState title="No returns yet" hint="Start the 2025 return to begin intake." />
              </CardBody>
            ) : (
              <Table>
                <THead columns={["Tax year", "Status", "Updated", ""]} />
                <tbody>
                  {(returns.data ?? []).map((ret) => (
                    <TRow key={ret.id}>
                      <TCell className="font-medium">{ret.taxYear}</TCell>
                      <TCell>
                        <StatusBadge status={ret.status} />
                      </TCell>
                      <TCell className="text-slate-400">{ret.updatedAt.slice(0, 10)}</TCell>
                      <TCell>
                        <Link
                          href={`/returns/${ret.id}`}
                          className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
                        >
                          Open workspace →
                        </Link>
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
