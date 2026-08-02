'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Panel, PanelBody, PanelHeader, StatusDot } from '@/components/ui/surface';
import { EmptyState } from '@/components/ui/state';
import { cn } from '@/lib/cn';
import {
  CURRENT_RETURNS,
  DEMO_AUDIT_EVENTS,
  DEMO_PROVIDERS,
  DEMO_TAX_YEAR,
  authorizationsOutstanding,
  clientById,
  clientName,
  documentsAwaitingReview,
  formatIsoDateTime,
  formatOutcome,
  relativeToDemoNow,
  returnsByStage,
  returnsNeedingAttention,
  submissionsByStatus,
  totalDiagnostics,
  userName,
  type DemoReturn,
} from '@/lib/demo/practice';
import { DiagnosticsSummary, StageBadge, isBlocking } from './badges';
import { DataTable, RowLink, type Column } from './data-table';
import { Icon } from './icons';
import { DemoDataNote, PageBody, PageHeader, StatTile } from './page-header';
import { ROLE_LABEL, useSession } from './session';

/**
 * The dashboard is a queue, not a report.
 *
 * It answers one question — what needs a person today — and it answers it
 * differently depending on who is asking. An administrator is shown the
 * practice; a preparer is shown their own returns; a reviewer is shown what is
 * waiting on them. The figures underneath are counted from the records, never
 * asserted, so the tiles and the tables can never disagree.
 */
export function DashboardScreen(): React.JSX.Element {
  const { role, user } = useSession();
  const [failed, setFailed] = useState(false);

  const attention = useMemo(() => returnsNeedingAttention(), []);
  const diagnostics = useMemo(() => totalDiagnostics(), []);
  const documents = useMemo(() => documentsAwaitingReview(), []);
  const authorizations = useMemo(() => authorizationsOutstanding(), []);
  const filings = useMemo(() => submissionsByStatus(), []);
  const stages = useMemo(() => returnsByStage(), []);

  const rows = useMemo(() => {
    if (role === 'administrator') return attention;
    if (role === 'reviewer') return attention.filter((entry) => entry.reviewerId === user.id);
    return attention.filter((entry) => entry.preparerId === user.id);
  }, [role, user.id, attention]);

  const blocking = attention.filter((entry) => isBlocking(entry.diagnostics)).length;

  const columns: Column<DemoReturn>[] = [
    {
      key: 'client',
      header: 'Client',
      render: (row) => {
        const client = clientById(row.clientId);
        return (
          <RowLink
            href={`/app/clients/${row.clientId}`}
            primary={clientName(row.clientId)}
            secondary={client ? `${client.maskedTin} · ${row.federalForm}` : row.federalForm}
          />
        );
      },
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (row) => <StageBadge stage={row.stage} />,
    },
    {
      key: 'diagnostics',
      header: 'Open diagnostics',
      hideBelow: 'md',
      render: (row) => <DiagnosticsSummary counts={row.diagnostics} />,
    },
    {
      key: 'owner',
      header: role === 'reviewer' ? 'Preparer' : 'Reviewer',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-ink-muted">
          {role === 'reviewer'
            ? userName(row.preparerId)
            : row.reviewerId
              ? userName(row.reviewerId)
              : 'Not assigned'}
        </span>
      ),
    },
    {
      key: 'outcome',
      header: 'Outcome',
      numeric: true,
      hideBelow: 'sm',
      render: (row) => {
        const outcome = formatOutcome(row.refundOrBalance);
        return (
          <span className={outcome.kind === 'due' ? 'text-reject-strong' : 'text-ink'}>
            {outcome.text}
          </span>
        );
      },
    },
    {
      key: 'updated',
      header: 'Last activity',
      numeric: true,
      render: (row) => <span className="text-ink-muted">{relativeToDemoNow(row.updatedAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`Tax year ${DEMO_TAX_YEAR}`}
        title="Today"
        description={
          role === 'administrator'
            ? 'What the practice owes attention to, across every preparer.'
            : role === 'reviewer'
              ? 'Returns waiting on your review, and what is blocking them.'
              : 'Your returns, and what is stopping each one from moving.'
        }
        meta={
          <>
            <span>
              Signed in as <span className="text-ink">{user.name}</span> ·{' '}
              {ROLE_LABEL[role].toLowerCase()}
            </span>
            <span>
              Federal filing deadline <span className="tabular text-ink">15 Apr 2026</span>
            </span>
          </>
        }
        actions={
          <>
            <ButtonLink
              href="/app/clients/new"
              size="sm"
              leading={<Icon name="plus" className="size-4" />}
            >
              New client
            </ButtonLink>
            <ButtonLink href="/app/returns" size="sm" variant="secondary">
              All returns
            </ButtonLink>
          </>
        }
      />

      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Returns needing attention"
            value={attention.length}
            detail={`${CURRENT_RETURNS.length} returns open for the year`}
            tone={attention.length > 0 ? 'warning' : 'neutral'}
            href="/app/returns"
          />
          <StatTile
            label="Blocking diagnostics"
            value={diagnostics.reject + diagnostics.error}
            detail={`${diagnostics.reject} reject and ${diagnostics.error} error across ${blocking} returns`}
            tone={diagnostics.reject + diagnostics.error > 0 ? 'reject' : 'success'}
            href="/app/review"
          />
          <StatTile
            label="Documents awaiting review"
            value={documents.length}
            detail="Uploaded but not yet accepted onto a return"
            tone={documents.length > 0 ? 'accent' : 'neutral'}
            href="/app/documents"
          />
          <StatTile
            label="Authorizations outstanding"
            value={authorizations.length}
            detail="Sent to the taxpayer, not yet signed"
            tone={authorizations.length > 0 ? 'warning' : 'neutral'}
            href="/app/authorizations"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-ui font-semibold text-ink">
                    {role === 'administrator'
                      ? 'The practice queue'
                      : role === 'reviewer'
                        ? 'Waiting on your review'
                        : 'Your queue'}
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Returns in review, returns rejected by a taxing authority, and returns carrying
                    a blocking diagnostic.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFailed((value) => !value)}
                  className="rounded-xs text-micro text-ink-subtle underline decoration-line underline-offset-[3px] hover:text-ink"
                >
                  {failed ? 'Restore the queue' : 'Preview the failure state'}
                </button>
              </div>

              <DataTable
                caption="Returns needing attention"
                columns={columns}
                rows={failed ? [] : rows}
                rowKey={(row) => row.id}
                error={
                  failed ? 'The queue service did not respond. Nothing has been changed.' : null
                }
                onRetry={() => setFailed(false)}
                minWidthClassName="min-w-[46rem]"
                empty={
                  <EmptyState
                    title="Nothing is waiting on you"
                    description="No return assigned to you is in review, rejected, or carrying a blocking diagnostic."
                    action={
                      <ButtonLink href="/app/returns" variant="secondary" size="sm">
                        Open all returns
                      </ButtonLink>
                    }
                  />
                }
                footer={
                  <p className="text-micro text-ink-muted">
                    <span className="tabular font-medium text-ink">{rows.length}</span> of{' '}
                    <span className="tabular">{CURRENT_RETURNS.length}</span> open returns need
                    attention.
                  </p>
                }
              />
            </div>

            <StageDistribution stages={stages} total={CURRENT_RETURNS.length} />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <FilingPanel filings={filings} />
            {role === 'administrator' ? <ProviderHealthPanel /> : <DocumentQueuePanel />}
            {role === 'reviewer' || role === 'administrator' ? <RecentAuditPanel /> : null}
          </div>
        </div>

        <DemoDataNote />
      </PageBody>
    </>
  );
}

const stageFills: Record<string, string> = {
  intake: 'bg-line-strong',
  preparation: 'bg-accent-edge',
  review: 'bg-accent',
  signature: 'bg-warning',
  transmitted: 'bg-info',
  accepted: 'bg-success',
  rejected: 'bg-reject',
};

function StageDistribution({
  stages,
  total,
}: {
  stages: { key: string; label: string; count: number }[];
  total: number;
}): React.JSX.Element {
  const shown = stages.filter((stage) => stage.count > 0);

  return (
    <Panel>
      <PanelHeader
        title="Where the year stands"
        description={`Every ${DEMO_TAX_YEAR} return, by the stage it is sitting in.`}
      />
      <PanelBody>
        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken"
          role="img"
          aria-label={shown.map((stage) => `${stage.count} ${stage.label}`).join(', ')}
        >
          {shown.map((stage) => (
            <span
              key={stage.key}
              className={cn('h-full', stageFills[stage.key] ?? 'bg-line-strong')}
              style={{ width: `${(stage.count / Math.max(1, total)) * 100}%` }}
            />
          ))}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((stage) => (
            <li key={stage.key} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  stageFills[stage.key] ?? 'bg-line-strong',
                )}
              />
              <span className="min-w-0 truncate text-ink-muted">{stage.label}</span>
              <span className="tabular ml-auto font-medium text-ink">{stage.count}</span>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

const filingTone: Record<string, string> = {
  queued: 'text-ink',
  transmitted: 'text-info-strong',
  accepted: 'text-accent-text',
  rejected: 'text-reject-strong',
};

function FilingPanel({
  filings,
}: {
  filings: { key: string; label: string; count: number }[];
}): React.JSX.Element {
  return (
    <Panel>
      <PanelHeader
        title="Filings"
        description="Submissions to every jurisdiction, this season."
        actions={
          <Link href="/app/filing" className="rounded-xs text-micro font-medium text-accent-text">
            Open
          </Link>
        }
      />
      <PanelBody className="py-3">
        <ul className="divide-y divide-line-subtle">
          {filings.map((entry) => (
            <li key={entry.key} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-ink-muted">{entry.label}</span>
              <span
                className={cn('tabular text-ui font-semibold', filingTone[entry.key] ?? 'text-ink')}
              >
                {entry.count}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-micro text-ink-subtle">
          A rejected submission can be corrected and retransmitted from the rejections screen.
        </p>
      </PanelBody>
    </Panel>
  );
}

function DocumentQueuePanel(): React.JSX.Element {
  const documents = documentsAwaitingReview().slice(0, 5);

  return (
    <Panel>
      <PanelHeader
        title="Documents to look at"
        description="Uploaded, classified, not yet accepted."
        actions={
          <Link href="/app/documents" className="rounded-xs text-micro font-medium text-accent-text">
            Open
          </Link>
        }
      />
      <PanelBody className="py-2">
        {documents.length === 0 ? (
          <p className="py-4 text-sm text-ink-muted">Nothing is waiting to be reviewed.</p>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {documents.map((document) => (
              <li key={document.id} className="py-2.5">
                <Link
                  href={`/app/documents?document=${document.id}`}
                  className="block rounded-xs text-sm font-medium text-ink hover:text-accent-text"
                >
                  {document.fileName}
                </Link>
                <p className="mt-0.5 text-micro text-ink-subtle">
                  {clientName(document.clientId)} · {document.classification} ·{' '}
                  {relativeToDemoNow(document.uploadedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PanelBody>
    </Panel>
  );
}

const providerTone = {
  connected: 'success',
  error: 'error',
  not_configured: 'warning',
} as const;

function ProviderHealthPanel(): React.JSX.Element {
  return (
    <Panel>
      <PanelHeader
        title="Connections"
        description="The services this practice files and stores through."
        actions={
          <Link
            href="/app/settings/providers"
            className="rounded-xs text-micro font-medium text-accent-text"
          >
            Configure
          </Link>
        }
      />
      <PanelBody className="py-2">
        <ul className="divide-y divide-line-subtle">
          {DEMO_PROVIDERS.map((provider) => (
            <li key={provider.id} className="flex items-center gap-2.5 py-2.5">
              <StatusDot tone={providerTone[provider.status]} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{provider.name}</span>
              <span className="shrink-0 text-micro text-ink-subtle">
                {provider.status === 'connected'
                  ? 'Connected'
                  : provider.status === 'error'
                    ? 'Check failed'
                    : 'Not configured'}
              </span>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

function RecentAuditPanel(): React.JSX.Element {
  const events = DEMO_AUDIT_EVENTS.slice(0, 5);

  return (
    <Panel>
      <PanelHeader
        title="Recent activity"
        description="The last entries written to the audit history."
        actions={
          <Link href="/app/audit" className="rounded-xs text-micro font-medium text-accent-text">
            Open
          </Link>
        }
      />
      <PanelBody className="py-2">
        <ul className="divide-y divide-line-subtle">
          {events.map((event) => (
            <li key={event.id} className="py-2.5">
              <p className="text-sm text-ink">
                <span className="font-medium">{event.actorName}</span> · {event.action}
              </p>
              <p className="mt-0.5 truncate text-micro text-ink-subtle">{event.subject}</p>
              <p className="tabular mt-0.5 text-micro text-ink-subtle">
                {formatIsoDateTime(event.at)}
              </p>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}
