import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { getNotifications } from "@/lib/dashboard/data";
import { AlertsList } from "@/components/dashboard/notifications/alerts-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export const metadata: Metadata = {
  title: "Alerts",
  robots: { index: false, follow: false },
};

export default async function AlertsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Signal desk"
        icon={Bell}
        title="Alerts"
        description="System notifications and activity, surfaced with stronger hierarchy so the important stuff breaks through immediately."
        tone="signal"
      />
      <AlertsList initialNotifications={notifications} />
    </div>
  );
}
