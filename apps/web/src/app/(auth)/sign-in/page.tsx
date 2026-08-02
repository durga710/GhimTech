import type { Metadata } from 'next';
import { SignInForm } from '@/components/app/auth';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the GhimTech Tax workspace.',
  robots: { index: false, follow: false },
};

export default function SignInPage(): React.JSX.Element {
  return <SignInForm />;
}
