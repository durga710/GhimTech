import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/app/auth';

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Request a single-use link to set a new GhimTech Tax password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage(): React.JSX.Element {
  return <ForgotPasswordForm />;
}
