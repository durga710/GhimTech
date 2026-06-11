import type { Metadata } from "next";
import { Rocket } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { GcodeStudio } from "@/components/dashboard/gcode/gcode-studio";

export const metadata: Metadata = {
  title: "GCODE",
  robots: { index: false, follow: false },
};

/**
 * GCODE — the app-builder studio. Describe an app; it gets built into a
 * GitHub repo as a PR and runs live in the embedded preview pane.
 */
export default async function GcodePage() {
  await requireUser();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="h-11 w-11 shrink-0 rounded-xl grid place-items-center border border-vital-400/30
                     bg-gradient-to-br from-vital-400/25 via-signal-400/15 to-transparent
                     shadow-[0_0_28px_rgba(52,211,153,0.18)]"
        >
          <Rocket className="h-5 w-5 text-vital-200" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-white via-vital-200 to-signal-300 bg-clip-text text-transparent">
            GCODE
          </h1>
          <p className="text-sm text-zinc-400">
            Describe it. GCODE writes the code, opens the PR, and runs it live.
          </p>
        </div>
        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full border border-vital-400/25 bg-vital-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-vital-200">
          <span className="h-1.5 w-1.5 rounded-full bg-vital-300 animate-pulse" />
          studio online
        </span>
      </div>
      <GcodeStudio />
    </div>
  );
}
