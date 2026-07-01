import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { getInboxUnreadCount } from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Ghimtech operator command center.",
  robots: { index: false, follow: false },
};

/**
 * Dashboard layout.
 *
 * Wraps every dashboard route with:
 *   - sidebar (fixed left, 240px wide on lg+)
 *   - sticky top bar with search / time / user
 *
 * Auth gating happens in middleware.ts — by the time we render here, the
 * user is guaranteed to be authenticated.
 *
 * NOTE: This layout deliberately excludes the public marketing chrome.
 * Dashboards live in their own visual universe.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const inboxUnread = await getInboxUnreadCount();

  return (
    <div className="relative min-h-screen bg-ink-950">
      {/* Subtle backdrop — dimmer than the marketing pages, easier on eyes for long sessions */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(86,168,255,0.09),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(49,227,154,0.05),transparent_28%)]" />
        <div className="absolute top-0 right-0 h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(86,168,255,0.05),transparent_68%)] blur-3xl" />
      </div>

      <DashboardSidebar inboxUnread={inboxUnread} />

      <div className="lg:pl-60">
        <DashboardTopbar />
        <main className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
