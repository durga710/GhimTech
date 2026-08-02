'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import { Select } from '@/components/ui/form';
import { ROLE_LABEL, ROLE_SUMMARY, STAFF_ROLES, useSession, type StaffRole } from './session';

/**
 * The demonstration role switcher.
 *
 * Named for what it is. Changing this changes what the interface shows, not
 * what anyone is permitted to do — every real decision belongs to the server,
 * and this control would be worthless as a security boundary. Saying so on the
 * control itself is cheaper than letting somebody find out the hard way.
 */
export function RoleSwitcher({
  layout = 'inline',
  className,
}: {
  layout?: 'inline' | 'stacked';
  className?: string;
}): React.JSX.Element {
  const { role, setRole } = useSession();
  const id = useId();
  const noteId = `${id}-note`;

  const select = (
    <Select
      id={id}
      aria-describedby={noteId}
      value={role}
      onChange={(event) => setRole(event.target.value as StaffRole)}
      className={layout === 'inline' ? 'h-9 w-[10.5rem] text-xs' : ''}
    >
      {STAFF_ROLES.map((option) => (
        <option key={option} value={option}>
          {ROLE_LABEL[option]}
        </option>
      ))}
    </Select>
  );

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          Demo role switcher
        </label>
        <p id={noteId} className="text-xs text-ink-muted">
          Changes which screens this demonstration shows. It is not a permission control.
        </p>
        {select}
        <p className="text-xs text-ink-subtle">{ROLE_SUMMARY[role]}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label
        htmlFor={id}
        className="whitespace-nowrap text-micro font-medium uppercase tracking-[0.08em] text-ink-subtle max-xl:sr-only"
      >
        Demo role
      </label>
      {select}
      <span id={noteId} className="sr-only">
        A demonstration control. It changes which screens are shown and is not a permission control.
      </span>
    </div>
  );
}
