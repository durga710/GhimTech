import type { Metadata } from 'next';
import { DashboardScreen } from '@/components/app/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage(): React.JSX.Element {
  return <DashboardScreen />;
}
