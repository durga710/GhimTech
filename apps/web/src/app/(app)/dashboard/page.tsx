"use client";
import Link from "next/link";
import { Alert, Card, CardBody, CardHeader, CardTitle, Skeleton, StatusBadge } from "@ghimtech/ui";
import { useApi } from "@/lib/use-api";

interface Dashboard {
  returnsByStatus: Record<string, number>;
  totals: {
    clients: number;
    returns: number;
    awaitingReview: number;
    awaitingSignature: number;
    readyToFile: number;
    transmitted: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number | null;
  };
}

const STAT_CARDS: Array<{ key: keyof Dashboard["totals"]; label: string }> = [
  { key: "clients", label: "Clients" },
  { key: "returns", label: "Returns" },
  { key: "awaitingReview", label: "Awaiting review" },
  { key: "awaitingSignature", label: "Awaiting signature" },
  { key: "readyToFile", label: "Ready to file" },
  { key: "transmitted", label: "In transmission" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected / correcting" },
];

export default function DashboardPage() {
  const { data, error, loading } = useApi<Dashboard>("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">Filing season at a glance.</p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.key}>
            <CardBody>
              {loading ? (
                <Skeleton className="h-12" />
              ) : (
                <>
                  <p className="text-2xl font-semibold tabular-nums">
                    {data?.totals[stat.key] ?? 0}
                    {stat.key === "accepted" && data?.totals.acceptanceRate != null && (
                      <span className="ml-2 text-sm font-normal text-emerald-600">
                        {Math.round(data.totals.acceptanceRate * 100)}%
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                </>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Returns by status</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data?.returnsByStatus ?? {})
                .filter(([, count]) => count > 0)
                .map(([status, count]) => (
                  <Link key={status} href={`/returns?status=${status}`} className="group">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm transition-colors group-hover:border-brand-300 dark:border-slate-700">
                      <StatusBadge status={status} />
                      <span className="font-semibold tabular-nums">{count}</span>
                    </span>
                  </Link>
                ))}
              {Object.values(data?.returnsByStatus ?? {}).every((v) => v === 0) && (
                <p className="text-sm text-slate-500">
                  No returns yet — create a client, then start their 2025 return.
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
