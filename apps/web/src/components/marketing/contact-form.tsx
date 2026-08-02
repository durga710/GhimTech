'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, ButtonLink, TextLink } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Callout, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import { SuccessState } from '@/components/ui/state';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/components/marketing/site-contact';

/**
 * The contact form.
 *
 * Two commitments shape this component.
 *
 * First, validation is honest about *when* it speaks. A field is not marked
 * wrong until the writer has left it or has tried to send, because reddening
 * an email field while someone is still typing the third character is noise
 * dressed as help.
 *
 * Second, and more importantly: there is no inbox behind this form yet. Rather
 * than fake a delivery confirmation, a valid submission hands back a message
 * that is ready to send from the writer's own mail client, and says plainly
 * that nothing has been transmitted. A tax product that lies on its contact
 * page has already told you how it will behave with your data.
 */

const SUBJECTS = [
  { value: 'general', label: 'General question' },
  { value: 'product', label: 'Product, pricing and availability' },
  { value: 'situations', label: 'Whether my returns are supported' },
  { value: 'security', label: 'Security or privacy question' },
  { value: 'accessibility', label: 'Reporting an accessibility barrier' },
  { value: 'account', label: 'Help with an existing account' },
  { value: 'other', label: 'Something else' },
] as const;

type FieldName = 'name' | 'email' | 'subject' | 'message';

interface FormValues {
  name: string;
  practice: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormValues = { name: '', practice: '', email: '', subject: '', message: '' };

const NO_TOUCH: Record<FieldName, boolean> = {
  name: false,
  email: false,
  subject: false,
  message: false,
};

const MIN_MESSAGE = 20;

/**
 * Deliberately loose. A client-side pattern's job is to catch a typo, not to
 * adjudicate RFC 5322 — every address that this rejects and a mail server
 * would have accepted is a person we just turned away.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (values.name.trim().length === 0) {
    errors.name = 'Tell us who we are replying to.';
  }

  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = 'We need an address to reply to.';
  } else if (!EMAIL_SHAPE.test(email)) {
    errors.email = 'That does not look like an email address — check for a typo.';
  }

  if (values.subject.length === 0) {
    errors.subject = 'Pick the line that fits best. It decides who reads this first.';
  }

  const message = values.message.trim();
  if (message.length === 0) {
    errors.message = 'Say what you need. One sentence is enough.';
  } else if (message.length < MIN_MESSAGE) {
    errors.message = `A little more detail, please — at least ${MIN_MESSAGE} characters.`;
  }

  return errors;
}

function subjectLabel(value: string): string {
  return SUBJECTS.find((option) => option.value === value)?.label ?? 'General question';
}

function buildMailto(values: FormValues): string {
  const lines = [
    `Name: ${values.name.trim()}`,
    values.practice.trim().length > 0 ? `Practice: ${values.practice.trim()}` : null,
    `Email: ${values.email.trim()}`,
    '',
    values.message.trim(),
  ].filter((line): line is string => line !== null);

  const subject = encodeURIComponent(`${subjectLabel(values.subject)} — GhimTech Tax`);
  const body = encodeURIComponent(lines.join('\n'));
  return `${CONTACT_MAILTO}?subject=${subject}&body=${body}`;
}

export function ContactForm(): React.JSX.Element {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Record<FieldName, boolean>>(NO_TOUCH);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [prepared, setPrepared] = useState<FormValues | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const errors = validate(values);
  const errorEntries = Object.entries(errors) as Array<[FieldName, string]>;
  const showSummary = failedAttempts > 0 && errorEntries.length > 0;

  useEffect(() => {
    if (failedAttempts > 0) {
      summaryRef.current?.focus();
    }
  }, [failedAttempts]);

  function errorFor(field: FieldName): string | undefined {
    if (!touched[field] && failedAttempts === 0) return undefined;
    return errors[field];
  }

  function update(field: keyof FormValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: FieldName): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (errorEntries.length > 0) {
      setTouched({ name: true, email: true, subject: true, message: true });
      setFailedAttempts((count) => count + 1);
      return;
    }
    setFailedAttempts(0);
    setPrepared(values);
  }

  if (prepared) {
    return (
      <Panel tone="raised" className="overflow-hidden">
        <SuccessState
          title="Your message is ready to send"
          description="Nothing has been transmitted yet. This form is not connected to a mailbox — opening the message in your own email client is what actually sends it, and it means you keep a copy in your sent items."
          action={
            <>
              <ButtonLink href={buildMailto(prepared)} size="md">
                Open in your email client
              </ButtonLink>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setPrepared(null);
                  setValues(EMPTY);
                  setTouched(NO_TOUCH);
                }}
              >
                Write another
              </Button>
            </>
          }
        />
        <div className="border-t border-line-subtle px-5 py-4 text-sm text-ink-muted">
          If that button does nothing — plenty of browsers have no mail client registered — write
          to <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink> directly and paste your
          message in.
        </div>
      </Panel>
    );
  }

  return (
    <Panel tone="raised">
      <PanelHeader title="Write to us" description="Fields marked with an asterisk are required." />
      <PanelBody className="p-5 sm:p-6">
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          {showSummary ? (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="rounded-md border border-reject-edge bg-reject-tint px-4 py-3"
            >
              <p className="text-sm font-semibold text-ink">
                {errorEntries.length === 1
                  ? 'One field needs your attention before this can be sent.'
                  : `${errorEntries.length} fields need your attention before this can be sent.`}
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-reject-strong">
                {errorEntries.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" required error={errorFor('name')}>
              {(props) => (
                <Input
                  {...props}
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  invalid={Boolean(errorFor('name'))}
                  onChange={(event) => update('name', event.target.value)}
                  onBlur={() => markTouched('name')}
                />
              )}
            </Field>

            <Field
              label="Practice or firm"
              optional
              hint="Leave this blank if you are filing for yourself."
            >
              {(props) => (
                <Input
                  {...props}
                  name="practice"
                  autoComplete="organization"
                  value={values.practice}
                  onChange={(event) => update('practice', event.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label="Email address" required error={errorFor('email')}>
            {(props) => (
              <Input
                {...props}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                invalid={Boolean(errorFor('email'))}
                onChange={(event) => update('email', event.target.value)}
                onBlur={() => markTouched('email')}
              />
            )}
          </Field>

          <Field label="Subject" required error={errorFor('subject')}>
            {(props) => (
              <Select
                {...props}
                name="subject"
                value={values.subject}
                invalid={Boolean(errorFor('subject'))}
                onChange={(event) => {
                  update('subject', event.target.value);
                  markTouched('subject');
                }}
                onBlur={() => markTouched('subject')}
              >
                <option value="">Choose a subject…</option>
                {SUBJECTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Message"
            required
            error={errorFor('message')}
            hint="Please do not include Social Security numbers, account numbers or images of tax documents here. Email is not a safe place for them, and we will not ask you for them on this page."
          >
            {(props) => (
              <Textarea
                {...props}
                name="message"
                rows={7}
                value={values.message}
                invalid={Boolean(errorFor('message'))}
                onChange={(event) => update('message', event.target.value)}
                onBlur={() => markTouched('message')}
              />
            )}
          </Field>

          <Callout tone="neutral" title="Before you press send">
            This form is not yet wired to a mailbox. When the fields are valid it composes the
            message and hands it to your own email client, so you can see exactly what is being
            sent and to whom. We would rather say that than show you a confirmation screen that
            means nothing.
          </Callout>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              Prepare message
            </Button>
            <p className="text-sm text-ink-muted">
              or write straight to <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>
            </p>
          </div>
        </form>
      </PanelBody>
    </Panel>
  );
}
