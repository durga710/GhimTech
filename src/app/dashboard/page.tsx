import { getDashboardData } from "@/lib/dashboard/data";
import { WelcomeCard } from "@/components/dashboard/widgets/welcome-card";
import { OpsMetricsStrip } from "@/components/dashboard/widgets/ops-metrics-strip";
import { ProjectsWidget } from "@/components/dashboard/widgets/projects-widget";
import { TasksWidget } from "@/components/dashboard/widgets/tasks-widget";
import { ShipActivityChart } from "@/components/dashboard/widgets/ship-activity-chart";
import { NotificationsFeed } from "@/components/dashboard/widgets/notifications-feed";
import { PeaceOfMindMode } from "@/components/dashboard/widgets/peace-of-mind-mode";
import { GenerateBriefButton } from "@/components/dashboard/copilot/generate-brief-button";

/**
 * Dashboard overview page.
 *
 * React Server Component. Auth + DB happens server-side via
 * getDashboardData(), then everything is handed to client widgets for
 * interactivity. Single Promise.all() under the hood; one cold path
 * to the database per page load.
 *
 * If the user isn't authenticated, requireUser() inside the data layer
 * redirects to /sign-in BEFORE this component renders anything.
 */
export default async function DashboardOverviewPage() {
  const { user, projects, tasks, notifications, summary, analytics, opsMetrics } =
    await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <span className="label-tactical">Daily brief</span>
        <GenerateBriefButton />
      </div>
      <WelcomeCard firstName={user.firstName ?? null} summary={summary} />
      <OpsMetricsStrip metrics={opsMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <ProjectsWidget projects={projects} />
          <ShipActivityChart data={analytics} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <TasksWidget tasks={tasks} />
          <PeaceOfMindMode />
          <NotificationsFeed notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
