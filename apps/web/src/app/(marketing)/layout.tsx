import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

/**
 * The public shell.
 *
 * A skip link, one banner, one main landmark and one contentinfo. The route
 * group carries no path segment, so `(marketing)/page.tsx` is the site root.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
