import type { Metadata } from "next";
import { Settings as SettingsIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { IntegrationsSettings } from "@/components/dashboard/settings/integrations-settings";

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
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
          <SettingsIcon className="h-5 w-5 text-signal-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-zinc-500">Preferences for {user.email}</p>
        </div>
      </header>

      <IntegrationsSettings
        initial={{
          aiProvider: prefs.aiProvider,
          aiModel: prefs.aiModel,
          aiBaseUrl: prefs.aiBaseUrl ?? "",
          githubTokenSet: Boolean(prefs.githubToken),
        }}
        anthropicAvailable={Boolean(process.env.ANTHROPIC_API_KEY)}
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
