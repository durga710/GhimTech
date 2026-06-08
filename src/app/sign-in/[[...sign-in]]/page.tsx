import Link from "next/link";
import { signInWithPasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/shared/logo";
import { safeRedirectPath } from "@/lib/auth-policy";

type AuthSearchParams = Promise<{
  error?: string | string[];
  message?: string | string[];
  next?: string | string[];
}>;

const errorMessages: Record<string, string> = {
  "invalid-credentials": "Email or password is incorrect.",
  "not-allowed": "That email is not approved for the dashboard.",
  "supabase-env-missing": "Supabase Auth is not configured yet.",
};

const messageMessages: Record<string, string> = {
  "check-email": "Check your email to finish enrollment.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(firstParam(params.next));
  const error = firstParam(params.error);
  const message = firstParam(params.message);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-30" />
      </div>

      <Link
        href="/"
        aria-label="Ghimtech home"
        className="mb-8 inline-flex items-center text-white hover:text-signal-200 transition-colors"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <p className="mb-8 label-tactical">Operator sign-in · restricted access</p>

      <form action={signInWithPasswordAction} className="glass-panel-strong w-full max-w-md p-6">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <h1 className="text-2xl text-white">Command Center</h1>
          <p className="text-sm text-zinc-400">Sign in with your approved operator account.</p>
        </div>

        {error && errorMessages[error] ? (
          <p className="mt-5 rounded-lg border border-flare-400/25 bg-flare-400/10 px-3 py-2 text-sm text-flare-200">
            {errorMessages[error]}
          </p>
        ) : null}

        {message && messageMessages[message] ? (
          <p className="mt-5 rounded-lg border border-vital-400/25 bg-vital-400/10 px-3 py-2 text-sm text-vital-200">
            {messageMessages[message]}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label-tactical">Email</span>
            <input
              required
              autoComplete="email"
              inputMode="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-signal-400/50"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="label-tactical">Password</span>
            <input
              required
              autoComplete="current-password"
              minLength={8}
              maxLength={128}
              name="password"
              type="password"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-signal-400/50"
              placeholder="8 characters minimum"
            />
          </label>
        </div>

        <button type="submit" className="btn-signal mt-6 w-full rounded-lg">
          Sign in
        </button>

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link href="/" className="font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
            Back to site
          </Link>
          <Link
            href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
            className="font-mono text-signal-300 hover:text-signal-200 transition-colors"
          >
            Create account
          </Link>
        </div>
      </form>
    </main>
  );
}
