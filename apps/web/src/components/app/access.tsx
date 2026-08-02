'use client';

import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/surface';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from './icons';
import { ROLE_LABEL, useSession, type StaffRole } from './session';

/**
 * A refusal that explains itself.
 *
 * A role that cannot open a screen gets told what the screen is, why it is
 * closed to them, who can open it, and where to go instead. A blank page, or a
 * silent redirect to the dashboard, teaches nobody anything and looks like a
 * bug.
 *
 * Worth restating: this is presentation. The server is what actually refuses.
 */
export function AccessNotice({
  screen,
  purpose,
  allow,
}: {
  screen: string;
  purpose: string;
  allow: StaffRole[];
}): React.JSX.Element {
  const { role } = useSession();
  const names = allow.map((entry) => ROLE_LABEL[entry].toLowerCase());
  const readable =
    names.length <= 1
      ? (names[0] ?? 'no role')
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

  return (
    <Panel className="mx-auto max-w-2xl">
      <div className="flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
        <span className="grid size-10 place-items-center rounded-md border border-line-subtle bg-surface-sunken text-ink-subtle">
          <Icon name="lock" />
        </span>

        <div>
          <h2 className="text-h3 font-semibold text-ink">{screen} is not open to your role</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {purpose} It is available to the {readable} {allow.length === 1 ? 'role' : 'roles'}. You
            are signed in as a <strong className="font-medium text-ink">{ROLE_LABEL[role]}</strong>.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            An administrator can change your role from practice settings. Nothing has been hidden
            from the record — a role change is itself written to the audit history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/app" variant="secondary" size="sm">
            Back to the dashboard
          </ButtonLink>
          <ButtonLink href="/app/settings" variant="ghost" size="sm">
            Open settings
          </ButtonLink>
        </div>

        <p className="text-micro text-ink-subtle">
          In this demonstration you can change role from the switcher in the top bar. It is a
          display control, not a permission control.
        </p>
      </div>
    </Panel>
  );
}

/** Renders the screen when the role lists it, and an explained refusal when not. */
export function RoleGate({
  allow,
  screen,
  purpose,
  children,
}: {
  allow: StaffRole[];
  screen: string;
  purpose: string;
  children: ReactNode;
}): React.JSX.Element {
  const { role } = useSession();
  if (allow.includes(role)) return <>{children}</>;
  return <AccessNotice screen={screen} purpose={purpose} allow={allow} />;
}
