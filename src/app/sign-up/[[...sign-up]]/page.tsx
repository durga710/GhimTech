import Link from "next/link";
import { signUpWithPasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/shared/logo";
import { safeRedirectPath } from "@/lib/auth-policy";

type AuthSearchParams = Promise<{
  error?: string | string[];
  next?: string | string[];
}>;

const errorMessages: Record<string, string> = {
  "invalid-signup": "Use a valid email and a password of at least 8 characters.",
  "invalid-invite": "Enter the team invite code provided by the workspace owner.",
  "not-allowed": "That account is not approved for the dashboard.",
  "signup-failed": "Enrollment failed. Try signing in if the account already exists.",
  "supabase-env-missing": "Supabase Auth is not configured yet.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(firstParam(params.next));
  const error = firstParam(params.error);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-25" />
      </div>

      <Link
        href="/"
        aria-label="GhimTech home"
        className="mb-8 inline-flex items-center text-white transition-colors hover:text-vital-300"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <form action={signUpWithPasswordAction} className="surface-premium w-full max-w-md p-6 lg:p-8">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <p className="section-kicker text-vital-200">Invite-only enrollment</p>
          <h1 className="font-display text-3xl tracking-tight text-white">Request workspace access</h1>
          <p className="text-sm text-zinc-400">
            Create an approved GhimTech workspace account with the team invite code.
          </p>
        </div>

        {error && errorMessages[error] ? (
          <p className="mt-5 rounded-lg border border-flare-400/25 bg-flare-400/10 px-3 py-2 text-sm text-flare-200">
            {errorMessages[error]}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="label-tactical">First name</span>
            <input
              autoComplete="given-name"
              maxLength={80}
              name="firstName"
              type="text"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-vital-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vital-300/60"
              placeholder="Rey"
            />
          </label>

          <label className="block space-y-2">
            <span className="label-tactical">Last name</span>
            <input
              autoComplete="family-name"
              maxLength={80}
              name="lastName"
              type="text"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-vital-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vital-300/60"
              placeholder="Rey"
            />
          </label>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block space-y-2">
            <span className="label-tactical">Email</span>
            <input
              required
              autoComplete="email"
              inputMode="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-vital-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vital-300/60"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="label-tactical">Password</span>
            <input
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              name="password"
              type="password"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-vital-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vital-300/60"
              placeholder="8 characters minimum"
            />
          </label>

          <label className="block space-y-2">
            <span className="label-tactical">Invite code</span>
            <input
              autoComplete="off"
              maxLength={128}
              name="inviteCode"
              type="text"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-vital-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vital-300/60"
              placeholder="Team code"
            />
          </label>
        </div>

        <button
          type="submit"
          className="btn-vital mt-6 w-full rounded-lg"
        >
          Create account
        </button>

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link href="/" className="font-mono text-zinc-500 transition-colors hover:text-zinc-300">
            Back to site
          </Link>
          <Link
            href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="font-mono text-vital-300 transition-colors hover:text-vital-200"
          >
            Sign in
          </Link>
        </div>
      </form>
    </main>
  );
}
