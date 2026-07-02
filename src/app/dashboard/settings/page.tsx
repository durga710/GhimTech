import type { Metadata } from "next";
import { Settings as SettingsIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireUser();
  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Preferences"
        icon={SettingsIcon}
        title="Settings"
        description={`Preferences for ${user.email}. Keep the surface calm, practical, and tuned to how you actually work.`}
        tone="flare"
      />

      <SettingsForm
        initial={{
          peaceOfMindMode: prefs.peaceOfMindMode,
          notificationEmail: prefs.notificationEmail,
          weeklyDigest: prefs.weeklyDigest,
          aiBriefEnabled: prefs.aiBriefEnabled,
          dashboardDensity: prefs.dashboardDensity as "compact" | "comfortable" | "spacious",
        }}
      />
    </div>
  );
}
