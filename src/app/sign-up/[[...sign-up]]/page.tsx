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
    <main className="auth-shell relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <Link
        href="/"
        aria-label="GhimTech home"
        className="mb-8 inline-flex min-h-11 items-center text-slate-950 transition-colors hover:text-blue-800"
      >
        <Logo variant="lockup" size={28} />
      </Link>

      <form action={signUpWithPasswordAction} className="surface-premium w-full max-w-md p-6 lg:p-8">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <p className="section-kicker">Invite-only enrollment</p>
          <h1 className="font-display text-3xl tracking-tight text-slate-950">Request workspace access</h1>
          <p className="text-sm text-slate-600">
            Create an approved GhimTech workspace account with the team invite code.
          </p>
        </div>

        {error && errorMessages[error] ? (
          <p role="alert" className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
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
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700"
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
          <Link href="/" className="inline-flex min-h-11 items-center text-slate-600 transition-colors hover:text-slate-950">
            Back to site
          </Link>
          <Link
            href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex min-h-11 items-center font-semibold text-blue-700 transition-colors hover:text-blue-900"
          >
            Sign in
          </Link>
        </div>
      </form>
    </main>
  );
}
