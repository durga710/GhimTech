import Link from "next/link";
import { KeyRound, LayoutDashboard, ShieldCheck } from "lucide-react";
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
  "not-allowed": "That account is not approved for the dashboard.",
  "supabase-env-missing": "Supabase Auth is not configured yet.",
};

const messageMessages: Record<string, string> = {
  "check-email": "Check your email to finish enrollment.",
};

const TRUST_POINTS = [
  { icon: LayoutDashboard, label: "Private dashboard" },
  { icon: ShieldCheck, label: "Supabase-backed auth" },
  { icon: KeyRound, label: "Founder workspace" },
];

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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-25" />
      </div>

      <Link
        href="/"
        aria-label="GhimTech home"
        className="mb-8 inline-flex items-center text-white transition-colors hover:text-signal-200"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <div className="surface-premium w-full max-w-4xl overflow-hidden lg:grid lg:grid-cols-[1fr_0.85fr]">
        <form action={signInWithPasswordAction} className="p-6 lg:p-8">
          <input type="hidden" name="next" value={nextPath} />

          <div className="space-y-2">
            <p className="section-kicker">Restricted access</p>
            <h1 className="font-display text-3xl tracking-tight text-white">Secure operator entrance</h1>
            <p className="text-sm text-zinc-400">Sign in with an approved GhimTech workspace account.</p>
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
                className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-signal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-300/60"
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
                className="w-full rounded-lg border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-signal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-300/60"
                placeholder="8 characters minimum"
              />
            </label>
          </div>

          <button type="submit" className="btn-signal mt-6 w-full rounded-lg">
            Sign in
          </button>

          <div className="mt-5 flex items-center justify-between text-xs">
            <Link href="/" className="font-mono text-zinc-500 transition-colors hover:text-zinc-300">
              Back to site
            </Link>
            <Link
              href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              className="font-mono text-signal-300 transition-colors hover:text-signal-200"
            >
              Create account
            </Link>
          </div>
        </form>

        <aside className="hidden border-l border-white/[0.07] bg-ink-950/40 p-8 lg:flex lg:flex-col lg:justify-center">
          <p className="label-tactical">GhimTech workspace</p>
          <ul className="mt-6 space-y-5">
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-signal-300/20 bg-signal-300/10">
                  <point.icon className="h-4 w-4 text-signal-200" />
                </span>
                {point.label}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-zinc-500">
            Access is limited to approved accounts. Activity inside the workspace is
            attributable and account-scoped.
          </p>
        </aside>
      </div>
    </main>
  );
}
