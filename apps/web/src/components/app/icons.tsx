import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The workspace icon set.
 *
 * One geometry for all of them: a 20-unit box, 1.5-unit strokes, round joins,
 * no fills. Drawn rather than pulled from a package so that the navigation
 * rail reads as one family at 18 pixels, which is the size that actually
 * matters — the collapsed sidebar is the only place a preparer navigates by
 * shape instead of by word.
 */

export type IconName =
  | 'dashboard'
  | 'clients'
  | 'returns'
  | 'review'
  | 'documents'
  | 'filing'
  | 'rejections'
  | 'authorizations'
  | 'reports'
  | 'users'
  | 'providers'
  | 'security'
  | 'audit'
  | 'settings'
  | 'search'
  | 'menu'
  | 'close'
  | 'sun'
  | 'moon'
  | 'chevron-down'
  | 'chevron-right'
  | 'plus'
  | 'filter'
  | 'upload'
  | 'download'
  | 'more'
  | 'check'
  | 'arrow-right'
  | 'sort'
  | 'lock'
  | 'refresh'
  | 'eye';

const paths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="6.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="6.5" height="3.5" rx="1.5" />
      <rect x="12.5" y="3" width="4.5" height="4" rx="1.5" />
      <rect x="12.5" y="10" width="4.5" height="7" rx="1.5" />
    </>
  ),
  clients: (
    <>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.75 17c.4-2.7 2.6-4.5 5.25-4.5S12.85 14.3 13.25 17" />
      <path d="M14 4.2a2.9 2.9 0 0 1 0 5.6M15.5 12.9c1.2.6 2 1.8 2.2 3.3" />
    </>
  ),
  returns: (
    <>
      <path d="M5 2.75h6.5L15.5 6.8V17a.75.75 0 0 1-.75.75H5A.75.75 0 0 1 4.25 17V3.5A.75.75 0 0 1 5 2.75Z" />
      <path d="M11.25 2.9V7h4.1" />
      <path d="M7 11h6M7 14h4" />
    </>
  ),
  review: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 4 4" />
      <path d="m6.9 9.1 1.6 1.6L11.3 7" />
    </>
  ),
  documents: (
    <>
      <path d="M6.5 2.75h5l3.75 3.8V16a1.25 1.25 0 0 1-1.25 1.25h-7.5A1.25 1.25 0 0 1 5.25 16V4A1.25 1.25 0 0 1 6.5 2.75Z" />
      <path d="M11.25 2.9v3.9h3.9" />
    </>
  ),
  filing: (
    <>
      <path d="M2.75 10.5 5 4.25A1 1 0 0 1 5.95 3.5h8.1a1 1 0 0 1 .95.75l2.25 6.25" />
      <path d="M2.75 10.5h3.9l.9 2.25h4.9l.9-2.25h3.9V15a1.5 1.5 0 0 1-1.5 1.5H4.25A1.5 1.5 0 0 1 2.75 15v-4.5Z" />
    </>
  ),
  rejections: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="m7.5 7.5 5 5M12.5 7.5l-5 5" />
    </>
  ),
  authorizations: (
    <path d="M3 15.5c1.9 0 2.6-2.3 3.6-5.4C7.4 7.5 8 4.5 9.5 4.5c1.2 0 1.3 1.5.6 3.6-.8 2.4-2.2 4.6-2.2 6 0 .8.5 1.4 1.3 1.4 1.6 0 2.4-1.8 3.4-1.8.7 0 1 .5 1.4 1.1.3.5.7.7 1.3.7h1.7" />
  ),
  reports: (
    <>
      <path d="M3.25 3v13.25a.75.75 0 0 0 .75.75h13" />
      <path d="M6.75 13.5V9.5M10 13.5V5.75M13.25 13.5v-5.5M16.5 13.5V7" />
    </>
  ),
  users: (
    <>
      <circle cx="10" cy="6.5" r="3.25" />
      <path d="M4 16.75c.6-3 3-4.9 6-4.9s5.4 1.9 6 4.9" />
    </>
  ),
  providers: (
    <>
      <rect x="2.75" y="4.25" width="14.5" height="5" rx="1.5" />
      <rect x="2.75" y="11.75" width="14.5" height="5" rx="1.5" />
      <path d="M5.5 6.75h.01M5.5 14.25h.01" />
    </>
  ),
  security: (
    <>
      <path d="M10 2.75 4.5 5v4.7c0 3.3 2.2 6.3 5.5 7.55 3.3-1.25 5.5-4.25 5.5-7.55V5L10 2.75Z" />
      <path d="m7.6 10 1.7 1.7 3.3-3.6" />
    </>
  ),
  audit: (
    <>
      <path d="M4.25 3.75h11.5v12.5a1 1 0 0 1-1 1h-9.5a1 1 0 0 1-1-1V3.75Z" />
      <path d="M7 7.25h6M7 10.25h6M7 13.25h3.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.75v1.9M10 15.35v1.9M17.25 10h-1.9M4.65 10h-1.9M15.13 4.87l-1.34 1.34M6.21 13.79l-1.34 1.34M15.13 15.13l-1.34-1.34M6.21 6.21 4.87 4.87" />
    </>
  ),
  search: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.8 3.8" />
    </>
  ),
  menu: <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" />,
  close: <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.9v1.6M10 15.5v1.6M17.1 10h-1.6M4.5 10H2.9M15.02 4.98l-1.13 1.13M6.11 13.89l-1.13 1.13M15.02 15.02l-1.13-1.13M6.11 6.11 4.98 4.98" />
    </>
  ),
  moon: <path d="M15.9 12.4A6.6 6.6 0 0 1 7.6 4.1a6.75 6.75 0 1 0 8.3 8.3Z" />,
  'chevron-down': <path d="m5.5 8 4.5 4.5L14.5 8" />,
  'chevron-right': <path d="m8 5.5 4.5 4.5L8 14.5" />,
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  filter: <path d="M3.25 4.75h13.5l-5.25 6v5l-3 1.5v-6.5l-5.25-6Z" />,
  upload: (
    <>
      <path d="M10 13.5v-10M6.25 7.25 10 3.5l3.75 3.75" />
      <path d="M3.75 13v2.75a1 1 0 0 0 1 1h10.5a1 1 0 0 0 1-1V13" />
    </>
  ),
  download: (
    <>
      <path d="M10 3.5v10M6.25 9.75 10 13.5l3.75-3.75" />
      <path d="M3.75 13v2.75a1 1 0 0 0 1 1h10.5a1 1 0 0 0 1-1V13" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="10" r="1.15" />
      <circle cx="10" cy="10" r="1.15" />
      <circle cx="15" cy="10" r="1.15" />
    </>
  ),
  check: <path d="m4.75 10.5 3.5 3.5 7-8" />,
  'arrow-right': <path d="M3.75 10h12.5M11.5 5.25 16.25 10l-4.75 4.75" />,
  sort: <path d="M6.5 4.25v11.5M3.5 12.75l3 3 3-3M13.5 15.75V4.25M10.5 7.25l3-3 3 3" />,
  lock: (
    <>
      <rect x="4.25" y="8.75" width="11.5" height="8" rx="1.5" />
      <path d="M6.9 8.75V6.5a3.1 3.1 0 0 1 6.2 0v2.25" />
    </>
  ),
  refresh: (
    <>
      <path d="M16.25 10a6.25 6.25 0 1 1-1.9-4.5" />
      <path d="M16.5 3v3.25h-3.25" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 10s2.9-4.75 7.5-4.75S17.5 10 17.5 10s-2.9 4.75-7.5 4.75S2.5 10 2.5 10Z" />
      <circle cx="10" cy="10" r="2.1" />
    </>
  ),
};

export interface IconProps {
  name: IconName;
  className?: string;
  /** Supply a label only when the icon is the sole content of a control. */
  label?: string;
}

export function Icon({ name, className, label }: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-[18px] shrink-0', className)}
      role={label ? 'img' : 'presentation'}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {label ? <title>{label}</title> : null}
      {paths[name]}
    </svg>
  );
}

/**
 * Navigation icons are keyed by route so `APP_NAV` stays a plain data file with
 * no presentation in it.
 */
export const NAV_ICONS: Record<string, IconName> = {
  '/app': 'dashboard',
  '/app/clients': 'clients',
  '/app/returns': 'returns',
  '/app/review': 'review',
  '/app/documents': 'documents',
  '/app/filing': 'filing',
  '/app/filing/rejections': 'rejections',
  '/app/authorizations': 'authorizations',
  '/app/reports': 'reports',
  '/app/settings/users': 'users',
  '/app/settings/providers': 'providers',
  '/app/security': 'security',
  '/app/audit': 'audit',
  '/app/settings': 'settings',
};

export function navIcon(href: string): IconName {
  return NAV_ICONS[href] ?? 'dashboard';
}
