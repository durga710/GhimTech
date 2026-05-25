import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { getNotifications } from "@/lib/dashboard/data";
import { AlertsList } from "@/components/dashboard/notifications/alerts-list";

export const metadata: Metadata = {
  title: "Alerts",
  robots: { index: false, follow: false },
};

export default async function AlertsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
          <Bell className="h-5 w-5 text-signal-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Alerts</h1>
          <p className="text-sm text-zinc-500">System notifications & activity</p>
        </div>
      </header>

      <AlertsList initialNotifications={notifications} />
    </div>
  );
}
