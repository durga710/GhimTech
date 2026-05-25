import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getAnalytics, getOpsMetrics } from "@/lib/dashboard/data";
import { OpsMetricsStrip } from "@/components/dashboard/widgets/ops-metrics-strip";
import { ShipActivityChart } from "@/components/dashboard/widgets/ship-activity-chart";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const [analytics, opsMetrics] = await Promise.all([getAnalytics(), getOpsMetrics()]);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
          <BarChart3 className="h-5 w-5 text-signal-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-zinc-500">30-day activity & operating metrics</p>
        </div>
      </header>

      <OpsMetricsStrip metrics={opsMetrics} />
      <ShipActivityChart data={analytics} />
    </div>
  );
}
