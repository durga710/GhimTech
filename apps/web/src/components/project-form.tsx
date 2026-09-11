"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { budgets, timelines, validateEnquiry } from "@/lib/enquiry.mjs";
type Errors = Record<string, string>;
export function ProjectForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const requestId = useRef("");
  const statusRef = useRef<HTMLDivElement>(null);
  function showStatus(message: string) {
    setStatus(message);
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const checked = validateEnquiry(values);
    if (Object.keys(checked.errors).length) {
      setErrors(checked.errors);
      const field = form.elements.namedItem(Object.keys(checked.errors)[0]) as HTMLElement | null;
      field?.focus();
      return;
    }
    setErrors({});
    setStatus("");
    setPending(true);
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt, requestId: requestId.current }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        showStatus(
          result.message ||
            "We couldn’t confirm receipt. Your details are still here. Please try again.",
        );
        return;
      }
      setSuccess(true);
      showStatus(
        "Your project enquiry has been received. We’ll review the workflow and reply to the email you provided.",
      );
    } catch {
      showStatus("We couldn’t confirm receipt. Your details are still here. Please try again.");
    } finally {
      setPending(false);
    }
  }
  function field(
    name: string,
    label: string,
    options: {
      type?: string;
      long?: boolean;
      optional?: boolean;
      max?: number;
      autoComplete?: string;
    } = {},
  ) {
    return (
      <div className="field">
        <label htmlFor={name}>
          {label}
          {options.optional && <span className="optional">Optional</span>}
        </label>
        {options.long ? (
          <textarea
            id={name}
            name={name}
            required={!options.optional}
            maxLength={options.max || 3000}
            rows={4}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? name + "-error" : undefined}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={options.type || "text"}
            autoComplete={options.autoComplete}
            required={!options.optional}
            maxLength={options.max || 160}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? name + "-error" : undefined}
          />
        )}{" "}
        {errors[name] && (
          <span id={name + "-error"} className="field-error">
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="project-form">
      {!success && (
        <form onSubmit={submit} noValidate aria-busy={pending}>
          <fieldset disabled={pending} className="form-section">
            <legend>01 / Your business</legend>
            <div className="field-grid">
              {field("name", "Your name", { max: 120, autoComplete: "name" })}
              {field("email", "Email address", { type: "email", max: 254, autoComplete: "email" })}
              {field("company", "Company", { autoComplete: "organization" })}
              {field("website", "Website", {
                type: "url",
                optional: true,
                max: 500,
                autoComplete: "url",
              })}
            </div>
            {field("business", "What does your company do?", { long: true, max: 2000 })}
          </fieldset>
          <fieldset disabled={pending} className="form-section">
            <legend>02 / The work</legend>
            {field("bottleneck", "What’s currently slowing you down?", { long: true })}
            {field("currentProcess", "How do you handle the process today?", { long: true })}
            {field("idealSystem", "What would you like the ideal system to do?", { long: true })}
          </fieldset>
          <fieldset disabled={pending} className="form-section">
            <legend>03 / Practical details</legend>
            <div className="field-grid">
              {[
                ["budget", "Budget range", budgets],
                ["timeline", "Timeline", timelines],
              ].map(([key, label, items]) => (
                <div className="field" key={key as string}>
                  <label htmlFor={key as string}>
                    {label}
                    <span className="optional">Optional</span>
                  </label>
                  <select
                    name={key as string}
                    id={key as string}
                    aria-invalid={!!errors[key as string]}
                    aria-describedby={errors[key as string] ? key + "-error" : undefined}
                  >
                    <option value="">Select an option</option>
                    {(items as string[]).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  {errors[key as string] && (
                    <span className="field-error" id={key + "-error"}>
                      {errors[key as string]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {field("context", "Additional context", { long: true, optional: true })}
          </fieldset>
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="fax">Leave this field empty</label>
            <input name="fax" id="fax" tabIndex={-1} autoComplete="off" />
          </div>
          <p className="form-privacy">
            Required fields help us understand the work. Please don’t include passwords, patient
            information, or sensitive personal records. Read our{" "}
            <Link href="/privacy">privacy notice</Link>.
          </p>
          <button className="button" type="submit" disabled={pending}>
            {pending ? "Sending your enquiry…" : "Start a Conversation"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
      <div
        ref={statusRef}
        tabIndex={-1}
        role={success ? "status" : "alert"}
        className={status ? "form-status " + (success ? "" : "error") : undefined}
      >
        {success && <h2>A useful conversation starts here.</h2>}
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}
