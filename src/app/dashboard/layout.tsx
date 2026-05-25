import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

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
 * NOTE: This layout deliberately does NOT include the marketing TopNav or
 * SiteFooter. Dashboards live in their own visual universe.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-ink-950">
      {/* Subtle backdrop — dimmer than the marketing pages, easier on eyes for long sessions */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-[0.15]" />
        <div className="absolute top-0 right-0 h-[600px] w-[800px] rounded-full
                        bg-[radial-gradient(circle,rgba(58,164,255,0.06),transparent_70%)] blur-3xl" />
      </div>

      <DashboardSidebar />

      <div className="lg:pl-60">
        <DashboardTopbar />
        <main className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
