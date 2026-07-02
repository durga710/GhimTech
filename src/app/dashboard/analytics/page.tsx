import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getAnalytics, getOpsMetrics } from "@/lib/dashboard/data";
import { OpsMetricsStrip } from "@/components/dashboard/widgets/ops-metrics-strip";
import { ShipActivityChart } from "@/components/dashboard/widgets/ship-activity-chart";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const [analytics, opsMetrics] = await Promise.all([getAnalytics(), getOpsMetrics()]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Telemetry"
        icon={BarChart3}
        title="Analytics"
        description="30-day activity and operating metrics, framed as a premium control surface instead of a plain report."
        tone="vital"
      />
      <OpsMetricsStrip metrics={opsMetrics} />
      <ShipActivityChart data={analytics} />
    </div>
  );
}
