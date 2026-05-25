import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/**
 * Sign-up page — same theming as sign-in for visual consistency.
 *
 * Note: In production, you may want to disable open sign-ups for the
 * dashboard since this is a personal command center. The standard approach
 * is to configure Clerk's "restricted mode" so only invited operators
 * can create accounts. See Clerk dashboard → User & Authentication →
 * Restrictions → "Restrict sign-ups".
 */
export default function SignUpPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full
                        bg-[radial-gradient(circle,rgba(31,226,148,0.12),transparent_70%)] blur-3xl" />
      </div>

      <Link
        href="/"
        aria-label="Ghimtech home"
        className="mb-8 inline-flex items-center text-white hover:text-vital-300 transition-colors"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <p className="mb-8 label-tactical text-vital-300">Operator enrollment</p>

      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#1fe294",
            colorBackground: "rgba(15,18,24,0.6)",
            colorInputBackground: "rgba(7,8,12,0.6)",
            colorInputText: "#f4f6fa",
            colorText: "#f4f6fa",
            colorTextSecondary: "#a1a1aa",
            colorNeutral: "#f4f6fa",
            fontFamily: "Geist, system-ui, sans-serif",
            borderRadius: "12px",
          },
          elements: {
            rootBox: "w-full max-w-md",
            card:
              "bg-ink-900/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]",
            headerTitle: "font-display text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton:
              "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white",
            formButtonPrimary:
              "bg-gradient-to-b from-vital-300 to-vital-400 hover:from-vital-200 hover:to-vital-300 text-ink-900 shadow-[0_0_40px_-10px_rgba(31,226,148,0.45)] font-medium",
            footerActionLink: "text-vital-300 hover:text-vital-200",
            formFieldInput:
              "bg-ink-950/60 border border-white/[0.08] text-white focus:border-vital-400/50",
            dividerLine: "bg-white/[0.06]",
            dividerText: "text-zinc-500",
            footer: "hidden",
          },
        }}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />

      <Link
        href="/"
        className="mt-8 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        ← back to site
      </Link>
    </main>
  );
}
