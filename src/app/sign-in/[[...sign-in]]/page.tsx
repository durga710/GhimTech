import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/**
 * Sign-in page.
 *
 * Clerk handles all the actual auth — we just theme it to fit the site.
 * The `appearance` prop tokens are designed to mirror the carbon-glass
 * aesthetic exactly, so the auth surface feels native instead of a
 * 3rd-party widget dropped in.
 */
export default function SignInPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Ambient backdrop — keeps the auth screen visually consistent */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full
                        bg-[radial-gradient(circle,rgba(58,164,255,0.12),transparent_70%)] blur-3xl" />
      </div>

      {/* Canonical Ghimtech lockup */}
      <Link
        href="/"
        aria-label="Ghimtech home"
        className="mb-8 inline-flex items-center text-white hover:text-signal-200 transition-colors"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <p className="mb-8 label-tactical">Operator sign-in · restricted access</p>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#3aa4ff",
            colorBackground: "rgba(15,18,24,0.6)",
            colorInputBackground: "rgba(7,8,12,0.6)",
            colorInputText: "#f4f6fa",
            colorText: "#f4f6fa",
            colorTextSecondary: "#a1a1aa",
            colorNeutral: "#f4f6fa",
            colorDanger: "#ff5470",
            colorSuccess: "#1fe294",
            colorWarning: "#ffa726",
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
              "bg-gradient-to-b from-signal-300 to-signal-500 hover:from-signal-200 hover:to-signal-400 text-white shadow-[0_0_40px_-10px_rgba(58,164,255,0.45)] font-medium",
            footerActionLink: "text-signal-300 hover:text-signal-200",
            formFieldInput:
              "bg-ink-950/60 border border-white/[0.08] text-white focus:border-signal-400/50",
            identityPreviewEditButton: "text-signal-300",
            dividerLine: "bg-white/[0.06]",
            dividerText: "text-zinc-500",
            footer: "hidden", // hide the Clerk-branded footer
          },
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
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
