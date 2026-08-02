import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/shell';

/**
 * The authenticated workspace.
 *
 * Nothing under /app is public, so nothing under /app is indexable. Every
 * screen inside this layout renders into a content region that is already
 * sized — pages set their own padding and their own scroll behaviour, and a
 * full-height workspace can simply fill it.
 */
export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return <AppShell>{children}</AppShell>;
}
