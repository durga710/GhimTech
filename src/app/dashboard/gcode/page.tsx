import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { GcodeStudio } from "@/components/dashboard/gcode/gcode-studio";

export const metadata: Metadata = {
  title: "GCODE",
  robots: { index: false, follow: false },
};

/**
 * GCODE — the app-builder studio. Describe an app; it gets built into a
 * GitHub repo as a PR with a live Vercel preview.
 */
export default async function GcodePage() {
  await requireUser();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          GCODE <span className="font-mono text-xs text-vital-300 align-middle ml-1">app builder</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Describe it. GCODE builds it, opens the PR, and gives you a live preview.
        </p>
      </div>
      <GcodeStudio />
    </div>
  );
}
