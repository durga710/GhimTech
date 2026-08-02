"use client";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TCell,
  THead,
  TRow,
} from "@ghimtech/ui";
import { useApi } from "@/lib/use-api";

interface AuditRow {
  action: string;
  actorId: string;
  actorRole: string;
  entityType?: string;
  entityId?: string;
  occurredAt: string;
  hash: string;
}

export default function AuditPage() {
  const events = useApi<AuditRow[]>("/audit?limit=100");
  const verify = useApi<{ valid: boolean; length: number }>("/audit/verify");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-slate-500">
          Append-only, hash-chained record of every sensitive action.
        </p>
      </div>

      {verify.data && (
        <Alert tone={verify.data.valid ? "success" : "danger"} title="Chain integrity">
          {verify.data.valid
            ? `Verified — ${verify.data.length} events form an unbroken hash chain.`
            : "INTEGRITY FAILURE — the audit chain does not verify. Investigate immediately."}
        </Alert>
      )}
      {events.error && <Alert tone="danger">{events.error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        {events.loading ? (
          <CardBody>
            <Skeleton className="h-40" />
          </CardBody>
        ) : (
          <Table>
            <THead columns={["Time", "Action", "Actor", "Entity", "Hash"]} />
            <tbody>
              {[...(events.data ?? [])].reverse().map((event) => (
                <TRow key={event.hash}>
                  <TCell className="whitespace-nowrap text-xs text-slate-400">
                    {event.occurredAt.slice(0, 19).replace("T", " ")}
                  </TCell>
                  <TCell>
                    <Badge tone={event.action.startsWith("security.") ? "danger" : "neutral"}>
                      {event.action}
                    </Badge>
                  </TCell>
                  <TCell className="text-xs">{event.actorRole}</TCell>
                  <TCell className="text-xs">
                    {event.entityType ? `${event.entityType}` : "—"}
                  </TCell>
                  <TCell className="font-mono text-[10px] text-slate-400">
                    {event.hash.slice(0, 12)}…
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
