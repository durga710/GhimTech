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
    <main className="auth-shell relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <Link
        href="/"
        aria-label="GhimTech home"
        className="mb-8 inline-flex min-h-11 items-center text-slate-950 transition-colors hover:text-blue-800"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <div className="surface-premium w-full max-w-4xl overflow-hidden lg:grid lg:grid-cols-[1fr_0.85fr]">
        <form action={signInWithPasswordAction} className="p-6 lg:p-8">
          <input type="hidden" name="next" value={nextPath} />

          <div className="space-y-2">
            <p className="section-kicker">Restricted access</p>
            <h1 className="font-display text-3xl tracking-tight text-slate-950">Secure operator entrance</h1>
            <p className="text-sm text-slate-600">Sign in with an approved GhimTech workspace account.</p>
          </div>

          {error && errorMessages[error] ? (
            <p role="alert" className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {errorMessages[error]}
            </p>
          ) : null}

          {message && messageMessages[message] ? (
            <p role="status" className="mt-5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
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
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
                placeholder="8 characters minimum"
              />
            </label>
          </div>

          <button type="submit" className="btn-signal mt-6 w-full rounded-lg">
            Sign in
          </button>

          <div className="mt-5 flex items-center justify-between text-xs">
            <Link href="/" className="inline-flex min-h-11 items-center text-slate-600 transition-colors hover:text-slate-950">
              Back to site
            </Link>
            <Link
              href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
              className="inline-flex min-h-11 items-center font-semibold text-blue-700 transition-colors hover:text-blue-900"
            >
              Create account
            </Link>
          </div>
        </form>

        <aside className="hidden border-l border-slate-200 bg-slate-50 p-8 lg:flex lg:flex-col lg:justify-center">
          <p className="label-tactical">GhimTech workspace</p>
          <ul className="mt-6 space-y-5">
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white">
                  <point.icon className="h-4 w-4 text-blue-700" />
                </span>
                {point.label}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-slate-500">
            Access is limited to approved accounts. Activity inside the workspace is
            attributable and account-scoped.
          </p>
        </aside>
      </div>
    </main>
  );
}
