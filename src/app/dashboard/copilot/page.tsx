import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { CopilotChat } from "@/components/dashboard/copilot/copilot-chat";

export const metadata: Metadata = {
  title: "AI Copilot",
  robots: { index: false, follow: false },
};

export default function CopilotPage() {
  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
          <Sparkles className="h-5 w-5 text-signal-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">AI Copilot</h1>
          <p className="text-sm text-zinc-500">Chat with GPT-5 — it knows your projects, tasks &amp; RayHealthEVV</p>
        </div>
      </header>

      <CopilotChat />
    </div>
  );
}
