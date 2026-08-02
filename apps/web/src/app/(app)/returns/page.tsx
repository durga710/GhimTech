"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
  StatusBadge,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { useApi } from "@/lib/use-api";

interface ReturnRow {
  id: string;
  clientId: string;
  taxYear: number;
  status: string;
  updatedAt: string;
}

function ReturnsList() {
  const params = useSearchParams();
  const status = params.get("status");
  const { data, error, loading } = useApi<ReturnRow[]>(
    `/returns${status ? `?status=${encodeURIComponent(status)}` : ""}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Returns</h1>
        <p className="text-sm text-slate-500">
          {status ? (
            <>
              Filtered by <StatusBadge status={status} />
            </>
          ) : (
            "Every return in the current filing season."
          )}
        </p>
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      <Card>
        {loading ? (
          <CardBody>
            <Skeleton className="h-32" />
          </CardBody>
        ) : (data ?? []).length === 0 ? (
          <CardBody>
            <EmptyState title="No returns found" />
          </CardBody>
        ) : (
          <Table>
            <THead columns={["Tax year", "Status", "Updated", ""]} />
            <tbody>
              {(data ?? []).map((ret) => (
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
                      Open →
                    </Link>
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-32" />}>
      <ReturnsList />
    </Suspense>
  );
}
