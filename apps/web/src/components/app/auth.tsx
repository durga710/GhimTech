'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, ButtonLink, TextLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { SuccessState } from '@/components/ui/state';
import { Icon } from './icons';

/**
 * Sign-in, recovery and the second factor.
 *
 * The check runs in the browser because there is no server behind this build.
 * That is stated on the screen rather than implied — a demonstration that
 * pretends to authenticate is worse than one that admits it does not. The
 * states themselves are real: validation, a submitting state that cannot be
 * double-submitted, a refusal, a second factor, and a completion.
 */

export const DEMO_CREDENTIALS = {
  email: 'renata.kohl@ridgelinetax.example',
  password: 'ridgeline-demo',
  code: '240613',
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A deliberate pause so the submitting state is visible rather than theoretical. */
function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function DemoNotice({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <Callout tone="neutral" title="Demonstration sign-in" className="mb-6">
      {children}
    </Callout>
  );
}

function FormError({ message }: { message: string | null }): React.JSX.Element {
  return (
    <div aria-live="polite" className="empty:hidden">
      {message ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-reject-edge bg-reject-tint px-3 py-2.5 text-sm text-reject-strong"
        >
          <Icon name="rejections" className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

type SignInStep = 'credentials' | 'second-factor' | 'complete';

export function SignInForm(): React.JSX.Element {
  const [step, setStep] = useState<SignInStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();

  async function onCredentials(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const nextEmailError = !email.trim()
      ? 'Enter the email address your practice issued you.'
      : !EMAIL_PATTERN.test(email.trim())
        ? 'That does not look like an email address.'
        : undefined;
    const nextPasswordError = password ? undefined : 'Enter your password.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) return;

    setBusy(true);
    await pause(700);
    setBusy(false);

    if (
      email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      setFormError('That email address and password do not match an account.');
      return;
    }

    setStep('second-factor');
  }

  async function onSecondFactor(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const digits = code.replace(/\s/g, '');
    const nextCodeError =
      digits.length === 0
        ? 'Enter the six-digit code from your authenticator.'
        : !/^\d{6}$/.test(digits)
          ? 'The code is six digits.'
          : undefined;

    setCodeError(nextCodeError);
    setFormError(null);
    if (nextCodeError) return;

    setBusy(true);
    await pause(700);
    setBusy(false);

    if (digits !== DEMO_CREDENTIALS.code) {
      setFormError('That code is not valid. Codes expire after thirty seconds.');
      return;
    }
    setStep('complete');
  }

  if (step === 'complete') {
    return (
      <SuccessState
        title="Signed in"
        description={
          remember
            ? 'This device will not be asked for a second factor for the next thirty days.'
            : 'A second factor will be requested the next time you sign in.'
        }
        action={<ButtonLink href="/app">Open the workspace</ButtonLink>}
      />
    );
  }

  if (step === 'second-factor') {
    return (
      <div>
        <h1 className="text-h2 font-semibold text-ink">Second factor</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter the six-digit code from your authenticator app for{' '}
          <span className="font-medium text-ink">{email.trim()}</span>.
        </p>

        <DemoNotice>
          Use the code <code className="font-mono text-ink">{DEMO_CREDENTIALS.code}</code>. Any other
          six-digit code demonstrates the refusal.
        </DemoNotice>

        <form onSubmit={onSecondFactor} noValidate className="flex flex-col gap-4">
          <FormError message={formError} />

          <Field
            label="Authentication code"
            hint="Six digits, no spaces."
            required
            error={codeError}
          >
            {(props) => (
              <Input
                {...props}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                autoFocus
                numeric
                invalid={Boolean(codeError)}
                placeholder="000000"
              />
            )}
          </Field>

          <Button type="submit" block loading={busy}>
            Verify and continue
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <TextLink href="/two-factor">Use a recovery code</TextLink>
            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setCode('');
                setCodeError(undefined);
                setFormError(null);
              }}
              className="rounded-xs text-sm text-ink-muted underline decoration-line underline-offset-[3px] hover:text-ink"
            >
              Use a different account
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 font-semibold text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Use the account your practice issued you. Access is per person.
      </p>

      <DemoNotice>
        Nothing is transmitted; the check runs in this browser. Sign in with{' '}
        <code className="font-mono text-ink">{DEMO_CREDENTIALS.email}</code> and the password{' '}
        <code className="font-mono text-ink">{DEMO_CREDENTIALS.password}</code>. Anything else
        demonstrates the refusal.
      </DemoNotice>

      <form onSubmit={onCredentials} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />

        <Field label="Email address" required error={emailError}>
          {(props) => (
            <Input
              {...props}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              invalid={Boolean(emailError)}
              placeholder="you@practice.example"
            />
          )}
        </Field>

        <Field label="Password" required error={passwordError}>
          {(props) => (
            <Input
              {...props}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              invalid={Boolean(passwordError)}
            />
          )}
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            label="Remember this device"
            hint="Skips the second factor here for thirty days."
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <TextLink href="/forgot-password" className="text-sm">
            Forgot password
          </TextLink>
        </div>

        <Button type="submit" block loading={busy}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 border-t border-line-subtle pt-5 text-sm text-ink-muted">
        Are you a taxpayer rather than a preparer? Your practice sends you a portal link by email.{' '}
        <Link href="/contact" className="rounded-xs font-medium text-accent-text hover:underline">
          Contact us
        </Link>{' '}
        if you cannot find it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

export function ForgotPasswordForm(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const nextError = !email.trim()
      ? 'Enter your email address.'
      : !EMAIL_PATTERN.test(email.trim())
        ? 'That does not look like an email address.'
        : undefined;
    setEmailError(nextError);
    if (nextError) return;

    setBusy(true);
    await pause(700);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        {/*
          Deliberately the same message whether or not the address exists.
          Telling a stranger which addresses are registered is a disclosure in
          itself.
        */}
        <SuccessState
          title="Check your email"
          description="If an account exists for that address, a reset link is on its way. The link is valid for one hour and can be used once."
          action={
            <ButtonLink href="/sign-in" variant="secondary">
              Back to sign in
            </ButtonLink>
          }
        />
        <p className="mt-5 text-center text-sm text-ink-muted">
          Nothing arrived?{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="rounded-xs font-medium text-accent-text underline decoration-accent-edge underline-offset-[3px] hover:decoration-accent"
          >
            Try a different address
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h2 font-semibold text-ink">Reset your password</h1>
      <p className="mt-2 text-sm text-ink-muted">
        We will email a single-use link to the address on your account. Your current password keeps
        working until you set a new one.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <Field label="Email address" required error={emailError}>
          {(props) => (
            <Input
              {...props}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              invalid={Boolean(emailError)}
              placeholder="you@practice.example"
            />
          )}
        </Field>

        <Button type="submit" block loading={busy}>
          Send the reset link
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Remembered it? <TextLink href="/sign-in">Back to sign in</TextLink>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Second factor, as its own screen
// ---------------------------------------------------------------------------

export function TwoFactorForm(): React.JSX.Element {
  const [mode, setMode] = useState<'app' | 'recovery'>('app');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [noted, setNoted] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const entry = value.trim();
    const nextFieldError =
      entry.length === 0
        ? mode === 'app'
          ? 'Enter the six-digit code.'
          : 'Enter one of your recovery codes.'
        : mode === 'app' && !/^\d{6}$/.test(entry.replace(/\s/g, ''))
          ? 'The code is six digits.'
          : undefined;

    setFieldError(nextFieldError);
    setFormError(null);
    if (nextFieldError) return;

    setBusy(true);
    await pause(700);
    setBusy(false);

    if (mode === 'app' && entry.replace(/\s/g, '') !== DEMO_CREDENTIALS.code) {
      setFormError('That code is not valid. Codes expire after thirty seconds.');
      return;
    }
    if (mode === 'recovery' && entry.length < 8) {
      setFormError('That recovery code has already been used, or was never issued.');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <SuccessState
        title="Second factor accepted"
        description="You are signed in. Recovery codes can be regenerated from the security centre."
        action={<ButtonLink href="/app">Open the workspace</ButtonLink>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-h2 font-semibold text-ink">Confirm it is you</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {mode === 'app'
          ? 'Enter the six-digit code from your authenticator app.'
          : 'Enter one of the recovery codes you saved when you enrolled.'}
      </p>

      <DemoNotice>
        Use the code <code className="font-mono text-ink">{DEMO_CREDENTIALS.code}</code>, or any
        recovery code of eight characters or more. Shorter entries demonstrate the refusal.
      </DemoNotice>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />

        <Field
          label={mode === 'app' ? 'Authentication code' : 'Recovery code'}
          hint={mode === 'app' ? 'Six digits, no spaces.' : 'Each recovery code works once.'}
          required
          error={fieldError}
        >
          {(props) => (
            <Input
              {...props}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode={mode === 'app' ? 'numeric' : 'text'}
              autoComplete={mode === 'app' ? 'one-time-code' : 'off'}
              numeric
              invalid={Boolean(fieldError)}
              placeholder={mode === 'app' ? '000000' : 'xxxx-xxxx-xxxx'}
            />
          )}
        </Field>

        <Button type="submit" block loading={busy}>
          Verify
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-2 border-t border-line-subtle pt-5 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'app' ? 'recovery' : 'app');
            setValue('');
            setFieldError(undefined);
            setFormError(null);
          }}
          className="self-start rounded-xs font-medium text-accent-text underline decoration-accent-edge underline-offset-[3px] hover:decoration-accent"
        >
          {mode === 'app' ? 'Use a recovery code instead' : 'Use your authenticator app instead'}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNoted(true)}
            className="rounded-xs text-ink-muted underline decoration-line underline-offset-[3px] hover:text-ink"
          >
            Ask an administrator to reset enrolment
          </button>
          <span aria-live="polite" className="text-xs text-accent-text empty:hidden">
            {noted ? 'Request noted.' : ''}
          </span>
        </div>

        <TextLink href="/sign-in" className="self-start">
          Back to sign in
        </TextLink>
      </div>
    </div>
  );
}
