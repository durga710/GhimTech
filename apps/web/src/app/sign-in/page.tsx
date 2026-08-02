"use client";
/**
 * Sign-in: password → mandatory TOTP MFA (with first-time enrollment,
 * including the authenticator secret and one-time recovery codes).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, CardBody, Field, Input, Wordmark } from "@ghimtech/ui";
import { api, setSession, type SessionUser } from "@/lib/api";

type Stage =
  | { kind: "password" }
  | { kind: "mfa"; mfaToken: string; enrollment?: { secret: string; otpauthUrl: string } }
  | { kind: "recovery"; codes: string[] };

export default function SignInPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ kind: "password" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const result = await api<{
        mfaRequired: boolean;
        mfaToken: string;
        mfaEnrollment?: { secret: string; otpauthUrl: string };
      }>("/auth/login", { method: "POST", body: { email, password }, auth: false });
      setStage({ kind: "mfa", mfaToken: result.mfaToken, enrollment: result.mfaEnrollment });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(event: React.FormEvent) {
    event.preventDefault();
    if (stage.kind !== "mfa") return;
    setBusy(true);
    setError(undefined);
    try {
      const result = await api<{ token: string; user: SessionUser; recoveryCodes?: string[] }>(
        "/auth/mfa/verify",
        { method: "POST", body: { mfaToken: stage.mfaToken, code }, auth: false },
      );
      setSession(result.token, result.user);
      if (result.recoveryCodes) {
        setStage({ kind: "recovery", codes: result.recoveryCodes });
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center text-white">
          <Wordmark />
        </div>
        <Card className="shadow-panel">
          <CardBody className="space-y-4 p-6">
            {error && <Alert tone="danger">{error}</Alert>}

            {stage.kind === "password" && (
              <form onSubmit={submitPassword} className="space-y-4">
                <h1 className="text-lg font-semibold">Sign in</h1>
                <Field label="Email">
                  {(id) => (
                    <Input
                      id={id}
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Password">
                  {(id) => (
                    <Input
                      id={id}
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Checking…" : "Continue"}
                </Button>
              </form>
            )}

            {stage.kind === "mfa" && (
              <form onSubmit={submitMfa} className="space-y-4">
                <h1 className="text-lg font-semibold">Two-factor verification</h1>
                {stage.enrollment && (
                  <Alert tone="info" title="Set up your authenticator app">
                    <p className="mb-2">
                      Add this secret to your authenticator app (Google Authenticator, 1Password,
                      Authy), then enter the 6-digit code.
                    </p>
                    <code className="block break-all rounded bg-white/70 px-2 py-1 font-mono text-xs dark:bg-slate-900/60">
                      {stage.enrollment.secret}
                    </code>
                  </Alert>
                )}
                <Field label="6-digit code">
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    />
                  )}
                </Field>
                <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                  {busy ? "Verifying…" : "Verify and sign in"}
                </Button>
              </form>
            )}

            {stage.kind === "recovery" && (
              <div className="space-y-4">
                <h1 className="text-lg font-semibold">Save your recovery codes</h1>
                <Alert tone="warning">
                  Store these one-time recovery codes somewhere safe. They are shown only once and
                  each can be used if you lose access to your authenticator.
                </Alert>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {stage.codes.map((c) => (
                    <code key={c} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-700">
                      {c}
                    </code>
                  ))}
                </div>
                <Button className="w-full" onClick={() => router.push("/dashboard")}>
                  I saved them — continue
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
        <p className="text-center text-xs text-brand-200">
          GhimTech Tax — Built by GhimTech. Private platform; authorized users only. All activity is
          logged.
        </p>
      </div>
    </main>
  );
}
