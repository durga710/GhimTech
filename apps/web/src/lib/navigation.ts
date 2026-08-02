/**
 * Site and application navigation, declared once.
 *
 * The header, the mobile menu, the footer and the sitemap all read from this
 * file. A route that exists in the product but not in this list is a route no
 * one can find, so adding a page means adding it here — that is the point.
 */

export interface NavLink {
  label: string;
  href: string;
  /** One line of context, shown in the desktop dropdown and the mobile menu. */
  description?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

/**
 * Primary marketing navigation. Three groups is the ceiling before a menu bar
 * stops being scannable, so related pages are grouped rather than listed.
 */
export const PRIMARY_NAV: NavGroup[] = [
  {
    label: 'Product',
    links: [
      {
        label: 'Overview',
        href: '/product',
        description: 'What the software does, end to end.',
      },
      {
        label: 'How it works',
        href: '/how-it-works',
        description: 'Intake, preparation, review, signature, filing.',
      },
      {
        label: 'Supported tax situations',
        href: '/supported-tax-situations',
        description: 'The returns and schedules we handle.',
      },
      {
        label: 'Federal and Pennsylvania',
        href: '/federal-and-pennsylvania',
        description: 'Form 1040, PA-40, and the local filings that follow.',
      },
    ],
  },
  {
    label: 'Trust',
    links: [
      {
        label: 'Security and privacy',
        href: '/security',
        description: 'How documents and identifiers are protected.',
      },
      {
        label: 'Accessibility',
        href: '/accessibility',
        description: 'Our conformance target and how to report a barrier.',
      },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About GhimTech', href: '/about', description: 'Who builds this.' },
      { label: 'Contact', href: '/contact', description: 'Reach a person.' },
    ],
  },
];

/** Flat list used by the mobile menu and the sitemap. */
export const PRIMARY_NAV_FLAT: NavLink[] = PRIMARY_NAV.flatMap((group) => group.links);

export const SIGN_IN_HREF = '/sign-in';
export const CLIENT_PORTAL_HREF = '/portal';

export const FOOTER_NAV: NavGroup[] = [
  {
    label: 'Product',
    links: [
      { label: 'Overview', href: '/product' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Supported tax situations', href: '/supported-tax-situations' },
      { label: 'Federal and Pennsylvania', href: '/federal-and-pennsylvania' },
    ],
  },
  {
    label: 'Access',
    links: [
      { label: 'Sign in', href: SIGN_IN_HREF },
      { label: 'Client portal', href: CLIENT_PORTAL_HREF },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About GhimTech', href: '/about' },
      { label: 'Security and privacy', href: '/security' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
      { label: 'Accessibility statement', href: '/accessibility' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Authenticated application
// ---------------------------------------------------------------------------

/**
 * Roles are declared here so a navigation item can state who it is for. The
 * real authorisation decision belongs on the server; this only governs what a
 * signed-in user is shown, and hiding a link is never a security control.
 */
export type AppRole = 'administrator' | 'preparer' | 'reviewer' | 'client';

export interface AppNavItem extends NavLink {
  roles: AppRole[];
}

export interface AppNavSection {
  label: string;
  items: AppNavItem[];
}

const STAFF: AppRole[] = ['administrator', 'preparer', 'reviewer'];

export const APP_NAV: AppNavSection[] = [
  {
    label: 'Work',
    items: [
      { label: 'Dashboard', href: '/app', roles: STAFF, description: 'Today’s queue.' },
      { label: 'Clients', href: '/app/clients', roles: STAFF, description: 'Every taxpayer.' },
      {
        label: 'Returns',
        href: '/app/returns',
        roles: STAFF,
        description: 'Returns in preparation.',
      },
      {
        label: 'Review queue',
        href: '/app/review',
        roles: ['administrator', 'reviewer'],
        description: 'Awaiting a second set of eyes.',
      },
      {
        label: 'Documents',
        href: '/app/documents',
        roles: STAFF,
        description: 'Uploaded source documents.',
      },
    ],
  },
  {
    label: 'Filing',
    items: [
      {
        label: 'E-file submissions',
        href: '/app/filing',
        roles: STAFF,
        description: 'Transmitted, accepted, rejected.',
      },
      {
        label: 'Rejections',
        href: '/app/filing/rejections',
        roles: STAFF,
        description: 'Returns to correct and retransmit.',
      },
      {
        label: 'Authorizations',
        href: '/app/authorizations',
        roles: STAFF,
        description: 'Form 8879 signatures.',
      },
    ],
  },
  {
    label: 'Practice',
    items: [
      { label: 'Reports', href: '/app/reports', roles: ['administrator', 'preparer'] },
      { label: 'Users', href: '/app/settings/users', roles: ['administrator'] },
      { label: 'Providers', href: '/app/settings/providers', roles: ['administrator'] },
      { label: 'Security center', href: '/app/security', roles: ['administrator'] },
      { label: 'Audit history', href: '/app/audit', roles: ['administrator', 'reviewer'] },
      { label: 'Settings', href: '/app/settings', roles: STAFF },
    ],
  },
];

/** Client portal navigation. Deliberately short — five destinations, no more. */
export const PORTAL_NAV: NavLink[] = [
  { label: 'Overview', href: '/portal', description: 'Where your return stands.' },
  {
    label: 'Your information',
    href: '/portal/intake',
    description: 'The questions we need answered.',
  },
  { label: 'Documents', href: '/portal/documents', description: 'Upload and review.' },
  { label: 'Sign', href: '/portal/sign', description: 'Authorize your return for filing.' },
  { label: 'Filing status', href: '/portal/status', description: 'Track the submission.' },
];
