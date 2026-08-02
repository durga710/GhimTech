import type { Metadata } from 'next';
import { TwoFactorForm } from '@/components/app/auth';

export const metadata: Metadata = {
  title: 'Confirm it is you',
  description: 'Enter your second factor to finish signing in to GhimTech Tax.',
  robots: { index: false, follow: false },
};

export default function TwoFactorPage(): React.JSX.Element {
  return <TwoFactorForm />;
}
